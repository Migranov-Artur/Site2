import fs from "fs";
import path from "path";
import mammoth from "mammoth";
// Динамический импорт, чтобы избежать проблемы с отсутствующим файлом в pdf-parse
// import pdf from "pdf-parse";
import { GostFormatting } from "@shared/schema";
import { fileURLToPath } from "url";

/**
 * Extract text from various file formats
 */
export async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  try {
    const buffer = file.buffer;
    
    // Extract text based on file type
    switch (file.mimetype) {
      case "application/pdf":
        return extractTextFromPdf(buffer);
      
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return extractTextFromDocx(buffer);
      
      case "application/msword":
        return extractTextFromDoc(buffer);
      
      case "text/plain":
        return buffer.toString("utf-8");
      
      default:
        throw new Error(`Unsupported file type: ${file.mimetype}`);
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("Failed to extract text from file");
  }
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Динамически импортируем pdf-parse только внутри функции, 
    // чтобы избежать проблем с отсутствующими тестовыми файлами
    // при инициализации модуля
    const pdfParse = await import('pdf-parse').then(module => module.default);
    
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (pdfError) {
      console.error("PDF parsing error, returning fallback text:", pdfError);
      // В случае ошибки при парсинге, возвращаем простой текст
      return "Не удалось извлечь текст из PDF. Возможно, файл защищен или повреждён.";
    }
  } catch (error) {
    console.error("Error importing pdf-parse:", error);
    return "Ошибка при обработке PDF файла.";
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

/**
 * Extract text from DOC file
 * This is a simplified implementation. In a real application,
 * you might need a more robust DOC parser.
 */
async function extractTextFromDoc(buffer: Buffer): Promise<string> {
  try {
    // Write buffer to temp file
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const tempFile = path.join(__dirname, "..", "temp", `temp_${Date.now()}.doc`);
    fs.writeFileSync(tempFile, buffer);
    
    // Use mammoth to extract text (it might work for some DOC files)
    // In a real app, you would use a more robust DOC parser
    const result = await mammoth.extractRawText({ path: tempFile });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOC:", error);
    throw new Error("Failed to extract text from DOC");
  }
}

/**
 * Process document with formatting
 * In a real implementation, this would apply GOST formatting
 * and return a properly formatted document
 */
/**
 * Создает DOCX документ с форматированием по ГОСТ
 *
 * @param text Текст документа
 * @param formattingOptions Опции форматирования (если есть)
 * @returns Буфер с документом DOCX
 */
export async function processDocument(
  text: string,
  formattingOptions?: any
): Promise<Buffer> {
  try {
    const docxjs = await import("docx");
    
    console.log("Форматирование документа с опциями:", formattingOptions);
    
    // Параметры форматирования со значениями по умолчанию
    const fontFamily = formattingOptions?.options?.fontFamily || "Times New Roman";
    const fontSize = (formattingOptions?.options?.fontSize || 14) * 2; // В docx размер в половинных пунктах
    const lineSpacing = formattingOptions?.options?.lineSpacing || 1.5;
    const paragraphIndent = formattingOptions?.options?.paragraphIndent || 1.25;
    const textAlignment = formattingOptions?.options?.textAlignment || "justify";
    
    // Преобразуем текстовое выравнивание в константу docx
    let alignment: any = docxjs.AlignmentType.LEFT;
    if (textAlignment === "justify") {
      alignment = docxjs.AlignmentType.JUSTIFIED;
    } else if (textAlignment === "center") {
      alignment = docxjs.AlignmentType.CENTER;
    } else if (textAlignment === "right") {
      alignment = docxjs.AlignmentType.RIGHT;
    }
    
    // Поля страницы в дюймах (конвертируем из см)
    // Используем явное приведение типов, чтобы предотвратить ошибки TypeScript
    const topMargin = `${((formattingOptions?.options?.pageMargins?.top || 2) * 0.3937)}in`;
    const rightMargin = `${((formattingOptions?.options?.pageMargins?.right || 1.5) * 0.3937)}in`;
    const bottomMargin = `${((formattingOptions?.options?.pageMargins?.bottom || 2) * 0.3937)}in`;
    const leftMargin = `${((formattingOptions?.options?.pageMargins?.left || 3) * 0.3937)}in`;
    
    const pageMargins: any = {
      top: topMargin,
      right: rightMargin,
      bottom: bottomMargin,
      left: leftMargin,
    };
    
    console.log("Применяемые параметры форматирования:", {
      fontFamily,
      fontSize,
      lineSpacing,
      paragraphIndent,
      textAlignment,
      pageMargins
    });
    
    // Разбиваем текст на абзацы
    const paragraphs = text.split(/\n\s*\n/);
    const paragraphElements = paragraphs.map(para => {
      if (!para.trim()) return null;
      
      return new docxjs.Paragraph({
        children: [
          new docxjs.TextRun({
            text: para.trim(),
            font: fontFamily,
            size: fontSize
          }),
        ],
        alignment: alignment,
        spacing: {
          line: Math.round(lineSpacing * 240), // Межстрочный интервал (240 = одинарный)
          before: 0,
          after: 0
        },
        indent: {
          firstLine: docxjs.convertMillimetersToTwip(paragraphIndent * 10) // Преобразуем см в мм и затем в twip
        }
      });
    }).filter(p => p !== null);
    
    // Создаем документ
    const doc = new docxjs.Document({
      styles: {
        default: {
          document: {
            run: {
              font: fontFamily,
              size: fontSize
            },
            paragraph: {
              spacing: { line: Math.round(lineSpacing * 240) }
            }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              margin: pageMargins
            }
          },
          children: paragraphElements,
        },
      ],
    });
    
    // Генерируем буфер
    const buffer = await docxjs.Packer.toBuffer(doc);
    
    console.log("Документ успешно сгенерирован");
    return buffer;
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error("Failed to process document");
  }
}
