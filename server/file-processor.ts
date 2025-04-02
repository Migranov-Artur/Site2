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
export async function processDocument(
  text: string,
  formattingOptions?: any
): Promise<Buffer> {
  try {
    // This is a simplified implementation
    // In a real app, you would use a proper document generation library
    // like docx or pdfkit to create a formatted document
    
    // For now, we'll just create a minimal DOCX file with the text
    const docxjs = await import("docx");
    
    // Create a new document
    const doc = new docxjs.Document({
      sections: [
        {
          properties: {},
          children: [
            new docxjs.Paragraph({
              children: [
                new docxjs.TextRun(text),
              ],
            }),
          ],
        },
      ],
    });
    
    // Generate buffer
    const buffer = await docxjs.Packer.toBuffer(doc);
    
    return buffer;
  } catch (error) {
    console.error("Error processing document:", error);
    throw new Error("Failed to process document");
  }
}
