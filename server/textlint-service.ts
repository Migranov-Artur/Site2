import { TextLintEngine } from "textlint";
import path from "path";
import { fileURLToPath } from "url";
import { AnalysisResult } from "./openai-service";

// Определение пути к директории текущего файла
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "..", ".textlintrc");

/**
 * Сервис для проверки текста с помощью TextLint
 */
export class TextLintService {
  private engine: TextLintEngine;

  constructor() {
    // Создаем новый экземпляр TextLint с правилами из конфигурационного файла
    try {
      this.engine = new TextLintEngine({
        configFile: configPath,
      });
      console.log("TextLint engine successfully initialized");
    } catch (error) {
      console.error("Error initializing TextLint engine:", error);
      // Создаем экземпляр TextLint с базовыми правилами
      this.engine = new TextLintEngine({
        rules: [
          { ruleId: "common-misspellings", rule: require("textlint-rule-common-misspellings") },
          { ruleId: "no-todo", rule: require("textlint-rule-no-todo") },
          { ruleId: "write-good", rule: require("textlint-rule-write-good").default }
        ]
      });
    }
  }

  /**
   * Проверяет текст на ошибки и стилистические проблемы
   * @param text Текст для проверки
   * @returns Массив найденных проблем
   */
  async checkText(text: string): Promise<AnalysisResult[]> {
    try {
      const results = await this.engine.executeOnText(text);
      
      // Преобразуем результаты в формат, используемый в приложении
      const analysisResults: AnalysisResult[] = [];
      
      for (const result of results) {
        if (result.messages.length > 0) {
          for (const message of result.messages) {
            // Определение степени серьезности на основе уровня сообщения
            let severity: "low" | "medium" | "high" = "medium";
            
            if (message.severity === 2) {
              severity = "high";
            } else if (message.severity === 1) {
              severity = "medium";
            } else {
              severity = "low";
            }
            
            // Получаем контекст для сообщения (текст вокруг проблемного места)
            const lines = text.split("\n");
            const line = lines[message.line - 1] || "";
            
            // Создаем объект результата
            // Попытаемся сгенерировать улучшенную версию текста на основе сообщения
            let improved = line;
            
            // TextLint не всегда предоставляет исправления, попробуем предложить базовые исправления
            if (message.fix && message.fix.range && message.fix.text !== undefined) {
              // Если есть предложение исправления, применяем его
              const [start, end] = message.fix.range;
              improved = line.substring(0, start - (message.column - 1)) + 
                        message.fix.text + 
                        line.substring(end - (message.column - 1));
            } else {
              // Если нет готового исправления, применяем простую эвристику на основе типа ошибки
              if (message.ruleId === "common-misspellings") {
                // Ищем слово с опечаткой
                const match = message.message.match(/Did you mean "([^"]+)"/);
                if (match && match[1]) {
                  // Заменяем опечатку предложенным вариантом
                  // Находим слово, близкое к позиции ошибки
                  const words = line.split(/\b/);
                  let position = 0;
                  let wordIndex = -1;
                  
                  for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    if (position <= message.column - 1 && position + word.length >= message.column - 1) {
                      wordIndex = i;
                      break;
                    }
                    position += word.length;
                  }
                  
                  if (wordIndex >= 0) {
                    words[wordIndex] = match[1];
                    improved = words.join('');
                  }
                }
              } else if (message.ruleId === "terminology") {
                // Ищем термин, который нужно заменить
                const match = message.message.match(/Use "([^"]+)" instead of "([^"]+)"/);
                if (match && match[1] && match[2]) {
                  improved = line.replace(new RegExp(match[2], 'g'), match[1]);
                }
              } else if (message.ruleId === "write-good") {
                // Для стилистических ошибок предлагаем упрощение
                // Находим проблемную фразу близкую к позиции ошибки
                const words = line.split(/\s+/);
                let position = 0;
                let startWord = -1;
                let endWord = -1;
                
                // Находим начало и конец проблемной фразы (примерно)
                for (let i = 0; i < words.length; i++) {
                  const word = words[i];
                  const wordLength = word.length + 1; // +1 для пробела
                  
                  if (position <= message.column - 1 && position + wordLength >= message.column - 1) {
                    startWord = Math.max(0, i - 1);
                    endWord = Math.min(words.length - 1, i + 2);
                    break;
                  }
                  position += wordLength;
                }
                
                if (startWord >= 0 && endWord >= 0) {
                  // Выделяем проблемную фразу
                  const problemPhrase = words.slice(startWord, endWord + 1).join(' ');
                  
                  // Предлагаем упрощенную версию на основе типа сообщения
                  let simplifiedPhrase = problemPhrase;
                  
                  if (message.message.includes("passive voice")) {
                    // Попытка преобразовать пассивный залог в активный (упрощенно)
                    simplifiedPhrase = simplifiedPhrase.replace(/(был|была|было|были)\s+(\w+н[а-я]+)/g, '$2');
                  } else if (message.message.includes("wordy")) {
                    // Упрощаем многословные конструкции
                    simplifiedPhrase = simplifiedPhrase
                      .replace(/в связи с (тем|этим), что/g, 'поскольку')
                      .replace(/с целью/g, 'чтобы')
                      .replace(/в настоящее время/g, 'сейчас')
                      .replace(/в данный момент/g, 'сейчас')
                      .replace(/для того чтобы/g, 'чтобы');
                  }
                  
                  // Если мы сделали изменения, обновляем строку
                  if (simplifiedPhrase !== problemPhrase) {
                    improved = line.replace(problemPhrase, simplifiedPhrase);
                  }
                }
              }
            }
            
            const result: AnalysisResult = {
              original: line,
              improved: improved,
              explanation: message.message,
              severity: severity
            };
            
            analysisResults.push(result);
          }
        }
      }
      
      return analysisResults;
    } catch (error) {
      console.error("Error checking text with TextLint:", error);
      return [];
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const textlintService = new TextLintService();
export default textlintService;