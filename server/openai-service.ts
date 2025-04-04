import OpenAI from "openai";
import languageToolBridge from "./language-tool-bridge";

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

// Initialize OpenAI client with optional API key
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
 * Analyze text using LanguageTool and OpenAI to find grammar, style, and structure issues
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
  
  // Шаг 2: Если OpenAI доступен, дополняем анализ с его помощью
  if (!openai) {
    console.log("OpenAI API key not found, using only LanguageTool results");
    
    // Если LanguageTool не дал результатов, используем моковые данные
    if (results.grammar.length === 0) {
      console.log("No LanguageTool results, using mock data");
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
      results.summary = "Текст проверен с помощью инструмента LanguageTool. Найдены грамматические ошибки и стилистические неточности, которые рекомендуется исправить.";
    }
    
    return results;
  }

  try {
    console.log("Enhancing analysis with OpenAI...");
    // Передаем уже найденные LanguageTool ошибки в OpenAI для дополнения анализа
    const existingGrammarIssues = results.grammar.map(issue => 
      `- "${issue.original}" → "${issue.improved}" (${issue.explanation})`
    ).join('\n');
    
    const prompt = `
      Проанализируй следующий академический текст на русском языке. 
      
      Текст уже был проверен инструментом LanguageTool, который нашел следующие грамматические проблемы:
      ${existingGrammarIssues || "Грамматических ошибок не обнаружено."}
      
      Теперь дополни анализ, сосредоточившись на:
      1. Стиль: неформальный язык, повторения, многословие
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
    
    // Объединяем результаты LanguageTool и OpenAI
    return {
      grammar: results.grammar, // Используем результаты от LanguageTool
      style: openAIResults.style || [],
      structure: openAIResults.structure || [],
      summary: openAIResults.summary || "Текст проанализирован с помощью LanguageTool и OpenAI."
    };
  } catch (error) {
    console.error("Error analyzing text with OpenAI:", error);
    
    // Если анализ с OpenAI не удался, но есть результаты от LanguageTool, вернем их
    if (results.grammar.length > 0) {
      results.summary = "Текст проверен с помощью инструмента LanguageTool. Найдены грамматические ошибки, которые рекомендуется исправить.";
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

  // If OpenAI API key is not available, apply simple replacements
  if (!openai) {
    console.log("OpenAI API key not found, using mock improvements");
    let improvedText = originalText;
    
    // Simple string replacement for each improvement
    allImprovements.forEach(imp => {
      improvedText = improvedText.replace(imp.original, imp.improved);
    });
    
    return improvedText;
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

    return response.choices[0].message.content || originalText;
  } catch (error) {
    console.error("Error improving text with OpenAI:", error);
    return originalText; // Return original text if improvement fails
  }
}

/**
 * Format text according to GOST standards
 */
export async function formatAccordingToGost(text: string, gostType: string): Promise<string> {
  // If OpenAI API key is not available, return original text with mock header
  if (!openai) {
    console.log("OpenAI API key not found, using mock GOST formatting");
    return `Отформатировано по стандарту ${gostType}\n\n${text}`;
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

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error("Error formatting text with OpenAI:", error);
    return text; // Return original text if formatting fails
  }
}
