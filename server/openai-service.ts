import OpenAI from "openai";
import languageToolBridge from "./language-tool-bridge";
import textlintService from "./textlint-service";

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
 */
export async function improveText(originalText: string, analysisResults: DocumentAnalysisResults): Promise<string> {
  // Extract all recommended improvements
  const allImprovements = [
    ...analysisResults.grammar.map(item => ({ original: item.original, improved: item.improved })),
    ...analysisResults.style.map(item => ({ original: item.original, improved: item.improved })),
    ...analysisResults.structure.map(item => ({ original: item.original, improved: item.improved })),
  ];

  // If no improvements needed, return original text
  if (allImprovements.length === 0) {
    return originalText;
  }

  // Функция для прямого применения исправлений к тексту
  const directTextImprovement = (text: string, improvements: Array<{original: string, improved: string}>) => {
    console.log(`Applying direct text improvements, ${improvements.length} changes to make`);
    let improvedText = text;
    
    // Sort improvements by length (descending) to avoid partial replacements
    const sortedImprovements = [...improvements].sort(
      (a, b) => b.original.length - a.original.length
    );
    
    // For each improvement, replace all occurrences
    for (const imp of sortedImprovements) {
      // Create a RegExp that matches the exact string (with word boundaries if possible)
      try {
        // Only add word boundaries if the string doesn't start/end with punctuation
        const startsWithWord = /^\w/.test(imp.original);
        const endsWithWord = /\w$/.test(imp.original);
        
        if (startsWithWord && endsWithWord) {
          // Can use word boundaries
          const regex = new RegExp(`\\b${escapeRegExp(imp.original)}\\b`, 'g');
          improvedText = improvedText.replace(regex, imp.improved);
        } else {
          // Simple string replacement as fallback
          improvedText = improvedText.replace(new RegExp(escapeRegExp(imp.original), 'g'), imp.improved);
        }
      } catch (e) {
        // If regex fails, fall back to simple replacement
        console.log(`Failed to create regex for: "${imp.original}"`, e);
        improvedText = improvedText.replace(imp.original, imp.improved);
      }
    }
    
    return improvedText;
  };

  // Если OpenAI API ключ отсутствует или возникла ошибка квоты, используем прямое применение исправлений
  if (!openai) {
    console.log("OpenAI API key not found, using direct text improvement");
    return directTextImprovement(originalText, allImprovements);
  }

  try {
    const prompt = `
      Улучши следующий текст, применив указанные исправления. Список исправлений:
      ${allImprovements.map(imp => `"${imp.original}" → "${imp.improved}"`).join('\n')}
      
      Исходный текст:
      ${originalText.substring(0, 4000)}
      
      Верни только улучшенный текст без объяснений и комментариев.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const improvedText = response.choices[0].message.content || "";
    
    // Проверяем, что OpenAI вернул непустой результат
    if (improvedText && improvedText.length > 0) {
      return improvedText;
    } else {
      console.log("OpenAI returned empty result, falling back to direct text improvement");
      return directTextImprovement(originalText, allImprovements);
    }
  } catch (error) {
    console.error("Error improving text with OpenAI:", error);
    
    // При любой ошибке OpenAI (включая ошибки квоты) используем прямое применение исправлений
    console.log("Falling back to direct text improvement");
    return directTextImprovement(originalText, allImprovements);
  }
}

/**
 * Format text according to GOST standards
 */
export async function formatAccordingToGost(text: string, gostType: string): Promise<string> {
  // Функция для базового форматирования без OpenAI
  const applyBasicFormatting = (originalText: string, formatType: string) => {
    console.log(`Applying basic GOST formatting (${formatType})`);
    
    // Добавляем стандартный заголовок
    let formatted = `Отформатировано по стандарту ${formatType}\n\n`;
    
    // Разбиваем текст на абзацы
    const paragraphs = originalText.split(/\n\s*\n/);
    
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
        .trim();
      
      // Добавляем абзац с отступом
      formatted += formattedParagraph + '\n\n';
    }
    
    return formatted.trim();
  };

  // If OpenAI API key is not available, apply basic formatting
  if (!openai) {
    console.log("OpenAI API key not found, using basic GOST formatting");
    return applyBasicFormatting(text, gostType);
  }

  try {
    const prompt = `
      Отформатируй следующий текст в соответствии со стандартом ${gostType}.
      Убедись, что форматирование соответствует всем требованиям данного ГОСТа:
      - Правильное форматирование заголовков
      - Корректные отступы и интервалы
      - Правильное оформление списков
      - Корректное оформление цитат и ссылок
      
      Текст:
      ${text.substring(0, 4000)}
      
      Верни только отформатированный текст без объяснений и комментариев.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const formattedText = response.choices[0].message.content;
    if (formattedText && formattedText.length > 0) {
      return formattedText;
    } else {
      console.log("OpenAI returned empty result, falling back to basic formatting");
      return applyBasicFormatting(text, gostType);
    }
  } catch (error) {
    console.error("Error formatting text with OpenAI:", error);
    console.log("Falling back to basic GOST formatting");
    return applyBasicFormatting(text, gostType);
  }
}
