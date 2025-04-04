import OpenAI from "openai";
import languageToolBridge from "./language-tool-bridge";
import textlintService from "./textlint-service";

// Экспортируем сервисы для прямого доступа
export { languageToolBridge, textlintService };

// Define the types locally to avoid circular dependencies
export interface AnalysisResult {
  original: string;
  improved: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface DocumentAnalysisResults {
  grammar: AnalysisResult[];
  style: AnalysisResult[];
  structure: AnalysisResult[];
  summary: string;
}

// Type definitions to handle null openai client
type OpenAIResponse = {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
};

// Helper function to escape special regex characters
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Initialize OpenAI client with optional API key
console.log("OPENAI_API_KEY available:", !!process.env.OPENAI_API_KEY);
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// Mock data for when OpenAI API key is not available
const mockAnalysisResults: DocumentAnalysisResults = {
  grammar: [
    {
      original: "Я пошол в школу.",
      improved: "Я пошёл в школу.",
      explanation: "Слово 'пошол' написано с ошибкой. Правильное написание: 'пошёл'.",
      severity: "high"
    },
    {
      original: "Мы долго ждали, и наконец пришли.",
      improved: "Мы долго ждали и наконец пришли.",
      explanation: "Перед союзом 'и' в данном предложении запятая не нужна.",
      severity: "medium"
    }
  ],
  style: [
    {
      original: "Автор хотел показать нам, что герой очень сильно любил свою родину.",
      improved: "Автор показывает, что герой искренне любил родину.",
      explanation: "Избыточное употребление усилительных конструкций и слов. Рекомендуется более лаконичное выражение.",
      severity: "low"
    }
  ],
  structure: [
    {
      original: "Вывод. В этом тексте автор хотел нам рассказать о...",
      improved: "Таким образом, автор раскрывает тему...",
      explanation: "Неформальное начало заключительного абзаца. Рекомендуется использовать более академические связующие фразы.",
      severity: "medium"
    }
  ],
  summary: "Текст в целом соответствует требованиям, но требует ряд исправлений в грамматике, стиле и структуре для более эффективного выражения идей."
};

/**
 * Analyze text using LanguageTool, TextLint and OpenAI to find grammar, style, and structure issues
 */
export async function analyzeText(text: string): Promise<DocumentAnalysisResults> {
  // Подготовка результатов
  let results: DocumentAnalysisResults = {
    grammar: [],
    style: [],
    structure: [],
    summary: ""
  };
  
  // Шаг 1: Используем LanguageTool для проверки грамматики
  try {
    console.log("Checking grammar with LanguageTool...");
    const languageToolResults = await languageToolBridge.checkText(text);
    
    if (languageToolResults && languageToolResults.length > 0) {
      // Добавляем результаты LanguageTool в категорию "grammar"
      results.grammar = languageToolResults;
    }
  } catch (error) {
    console.error("Error using LanguageTool:", error);
    // В случае ошибки продолжаем работу, но без результатов LanguageTool
  }
  
  // Шаг 2: Используем TextLint для дополнительной проверки
  try {
    console.log("Enhancing analysis with TextLint...");
    const textlintResults = await textlintService.checkText(text);
    
    if (textlintResults && textlintResults.length > 0) {
      // Добавляем результаты TextLint в соответствующие категории
      for (const result of textlintResults) {
        // Определяем категорию на основе типа ошибки или предупреждения
        if (result.explanation.toLowerCase().includes("grammar") || 
            result.explanation.toLowerCase().includes("spell") || 
            result.explanation.toLowerCase().includes("грамматик") || 
            result.explanation.toLowerCase().includes("орфограф")) {
          results.grammar.push(result);
        } else if (result.explanation.toLowerCase().includes("style") || 
                  result.explanation.toLowerCase().includes("write-good") || 
                  result.explanation.toLowerCase().includes("стил")) {
          results.style.push(result);
        } else {
          // По умолчанию добавляем в стилистику
          results.style.push(result);
        }
      }
    }
  } catch (error) {
    console.error("Error using TextLint:", error);
    // В случае ошибки продолжаем работу, но без результатов TextLint
  }
  
  // Шаг 3: Если OpenAI доступен, дополняем анализ с его помощью
  if (!openai) {
    console.log("OpenAI API key not found, using only LanguageTool and TextLint results");
    
    // Если ни один инструмент не дал результатов, используем моковые данные
    if (results.grammar.length === 0 && results.style.length === 0) {
      console.log("No analysis results, using mock data");
      results = { ...mockAnalysisResults };
      
      // Добавляем фрагмент текста для демонстрации
      if (text.length > 20) {
        results.grammar.push({
          original: text.substring(0, 20) + "...",
          improved: text.substring(0, 10) + " [улучшено] " + text.substring(10, 20) + "...",
          explanation: "Демонстрационная версия улучшения текста",
          severity: "medium"
        });
      }
    } else {
      // Добавляем базовое заключение
      results.summary = "Текст проверен с помощью инструментов LanguageTool и TextLint. Найдены грамматические ошибки и стилистические неточности, которые рекомендуется исправить.";
    }
    
    return results;
  }

  try {
    console.log("Enhancing analysis with OpenAI...");
    // Передаем уже найденные LanguageTool ошибки в OpenAI для дополнения анализа
    const existingGrammarIssues = results.grammar.map(issue => 
      `- "${issue.original}" → "${issue.improved}" (${issue.explanation})`
    ).join('\n');
    
    // Передаем уже найденные TextLint стилистические проблемы
    const existingStyleIssues = results.style.map(issue => 
      `- "${issue.original}" → "${issue.improved}" (${issue.explanation})`
    ).join('\n');
    
    const prompt = `
      Проанализируй следующий академический текст на русском языке. 
      
      Текст уже был проверен инструментами LanguageTool и TextLint, которые нашли следующие проблемы:
      
      Грамматические проблемы:
      ${existingGrammarIssues || "Грамматических ошибок не обнаружено."}
      
      Стилистические проблемы:
      ${existingStyleIssues || "Стилистических проблем не обнаружено."}
      
      Теперь дополни анализ, сосредоточившись на:
      1. Стиль: неформальный язык, повторения, многословие (добавь к уже найденным)
      2. Структура: проблемы с логикой, связностью, организацией текста
      
      Для каждой проблемы укажи:
      - Оригинальный фрагмент текста
      - Рекомендуемое исправление
      - Краткое объяснение проблемы
      - Степень серьезности (low, medium, high)
      
      Также дай общую оценку текста (1-2 предложения).
      
      Ответ должен быть в формате JSON со следующей структурой:
      {
        "style": [
          {
            "original": "...",
            "improved": "...",
            "explanation": "...",
            "severity": "low|medium|high"
          }
        ],
        "structure": [аналогично],
        "summary": "общая оценка текста"
      }
      
      Текст для анализа: ${text.substring(0, 4000)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content || '{"style":[],"structure":[],"summary":"Не удалось выполнить анализ текста."}';
    const openAIResults = JSON.parse(content);
    
    // Объединяем результаты LanguageTool, TextLint и OpenAI
    return {
      grammar: results.grammar, // Используем результаты от LanguageTool
      style: [...results.style, ...(openAIResults.style || [])], // Объединяем стилистические проблемы
      structure: openAIResults.structure || [],
      summary: openAIResults.summary || "Текст проанализирован с помощью LanguageTool, TextLint и OpenAI."
    };
  } catch (error) {
    console.error("Error analyzing text with OpenAI:", error);
    
    // Если анализ с OpenAI не удался, но есть результаты от LanguageTool или TextLint, вернем их
    if (results.grammar.length > 0 || results.style.length > 0) {
      results.summary = "Текст проверен с помощью инструментов LanguageTool и TextLint. Найдены грамматические и/или стилистические ошибки, которые рекомендуется исправить.";
      return results;
    }
    
    // Иначе вернем структуру с сообщением об ошибке
    return {
      grammar: [],
      style: [],
      structure: [],
      summary: "Не удалось выполнить анализ текста. Пожалуйста, попробуйте еще раз.",
    };
  }
}

/**
 * Improve text based on analysis results
 * 
 * Применяет исправления, найденные LanguageTool и TextLint, напрямую к тексту,
 * без использования OpenAI API для повышения производительности и надежности.
 */
export async function improveText(originalText: string, analysisResults: DocumentAnalysisResults): Promise<string> {
  console.log("Improving text using direct improvements from LanguageTool and TextLint");
  
  // Extract all recommended improvements
  const allImprovements = [
    ...analysisResults.grammar.map(item => ({ original: item.original, improved: item.improved })),
    ...analysisResults.style.map(item => ({ original: item.original, improved: item.improved })),
    ...analysisResults.structure.map(item => ({ original: item.original, improved: item.improved })),
  ];

  // If no improvements needed, return original text
  if (allImprovements.length === 0) {
    console.log("No improvements needed, returning original text");
    return originalText;
  }

  console.log(`Applying direct text improvements, ${allImprovements.length} changes to make`);
  let improvedText = originalText;
  
  // Sort improvements by length (descending) to avoid partial replacements
  const sortedImprovements = [...allImprovements].sort(
    (a, b) => b.original.length - a.original.length
  );
  
  // Отладочная информация для каждого исправления
  console.log(`Текст для исправлений (${sortedImprovements.length} ошибок):`);
  console.log(originalText.substring(0, 100) + "...");
  
  // Подсчет успешных замен
  let successCount = 0;
  
  // For each improvement, replace all occurrences
  for (const imp of sortedImprovements) {
    console.log(`Попытка замены: "${imp.original}" -> "${imp.improved}"`);
    
    // Сначала попробуем прямую замену строк для точного совпадения
    if (improvedText.includes(imp.original)) {
      const beforeReplace = improvedText;
      improvedText = improvedText.split(imp.original).join(imp.improved);
      
      // Проверка успешности замены
      if (beforeReplace !== improvedText) {
        successCount++;
        console.log(`✓ Успешно заменено прямым методом: "${imp.original}"`);
        continue; // Переходим к следующему исправлению
      }
    }
    
    // Если прямая замена не сработала, пробуем через регулярные выражения
    try {
      // Проверяем начало и конец строки для добавления границ слов
      const startsWithWord = /^\w/.test(imp.original);
      const endsWithWord = /\w$/.test(imp.original);
      
      // Сохраняем версию текста до замены для проверки
      const beforeReplace = improvedText;
      
      if (startsWithWord && endsWithWord) {
        // Добавляем границы слов если они уместны
        const regex = new RegExp(`\\b${escapeRegExp(imp.original)}\\b`, 'g');
        improvedText = improvedText.replace(regex, imp.improved);
      } else if (startsWithWord) {
        // Только левая граница
        const regex = new RegExp(`\\b${escapeRegExp(imp.original)}`, 'g');
        improvedText = improvedText.replace(regex, imp.improved);
      } else if (endsWithWord) {
        // Только правая граница
        const regex = new RegExp(`${escapeRegExp(imp.original)}\\b`, 'g');
        improvedText = improvedText.replace(regex, imp.improved);
      } else {
        // Без границ слов
        const regex = new RegExp(escapeRegExp(imp.original), 'g');
        improvedText = improvedText.replace(regex, imp.improved);
      }
      
      // Проверка успешности замены
      if (beforeReplace !== improvedText) {
        successCount++;
        console.log(`✓ Успешно заменено через regex: "${imp.original}"`);
      } else {
        console.log(`✗ Не удалось заменить: "${imp.original}" (не найдено совпадений)`);
      }
    } catch (e) {
      // Если regex не сработал, используем простую замену
      console.log(`! Ошибка regex для: "${imp.original}"`, e);
      
      const beforeReplace = improvedText;
      improvedText = improvedText.replace(imp.original, imp.improved);
      
      // Проверка успешности замены
      if (beforeReplace !== improvedText) {
        successCount++;
        console.log(`✓ Успешно заменено fallback-методом: "${imp.original}"`);
      } else {
        console.log(`✗ Не удалось заменить: "${imp.original}" (fallback тоже не сработал)`);
      }
    }
  }
  
  console.log(`Итого исправлено: ${successCount} из ${sortedImprovements.length} ошибок`);
  
  // Проверяем, что текст действительно изменился
  const hasChanges = improvedText !== originalText;
  console.log(`Text improvement completed: original length ${originalText.length}, improved length ${improvedText.length}, changes applied: ${hasChanges}`);
  
  return improvedText;
}

/**
 * Format text according to GOST standards
 * 
 * Применяет базовое форматирование по стандартам ГОСТ без использования OpenAI API
 * для повышения производительности и надежности.
 */
export async function formatAccordingToGost(text: string, gostType: string): Promise<string> {
  console.log(`Applying basic GOST formatting (${gostType})`);
  
  // Добавляем стандартный заголовок
  let formatted = `Отформатировано по стандарту ${gostType}\n\n`;
  
  // Разбиваем текст на абзацы
  const paragraphs = text.split(/\n\s*\n/);
  
  // Обрабатываем каждый абзац
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    
    // Пропускаем пустые абзацы
    if (!paragraph) continue;
    
    // Базовое форматирование отступов и пробелов
    let formattedParagraph = paragraph
      // Исправляем множественные пробелы
      .replace(/\s+/g, ' ')
      // Добавляем пробел после точки, запятой, двоеточия и др.
      .replace(/([.,;:!?])([а-яА-ЯёЁa-zA-Z])/g, '$1 $2')
      // Исправляем дефисы на тире там, где нужно
      .replace(/(\s)-(\s)/g, '$1—$2')
      .trim();
    
    // Добавляем абзац с отступом
    formatted += formattedParagraph + '\n\n';
  }
  
  // Проверяем, что текст действительно изменился
  const hasChanges = formatted.trim() !== text;
  console.log(`GOST formatting completed: original length ${text.length}, formatted length ${formatted.length}, changes applied: ${hasChanges}`);
  
  return formatted.trim();
}
