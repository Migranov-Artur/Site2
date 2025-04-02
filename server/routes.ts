import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as multerDefault from "multer";
const multer = multerDefault.default || multerDefault;
import { processDocument, extractTextFromFile } from "./file-processor";
import { analyzeText, improveText, formatAccordingToGost } from "./openai-service";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow certain file types
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Неподдерживаемый формат файла. Поддерживаются только PDF, DOCX, DOC и TXT."));
    }
  },
});

// Temporary storage directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, "..", "temp");

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", (req, res, next) => {
    // Add route-specific middleware here
    next();
  });

  // Upload document
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Файл не загружен" });
      }

      // Extract text from uploaded file
      const originalText = await extractTextFromFile(req.file);
      
      // Create document in storage
      const document = await storage.createDocument({
        fileName: req.file.originalname,
        originalText,
        originalType: req.file.mimetype,
        createdAt: new Date().toISOString(),
      });

      // Save file to temporary location for future processing
      const filePath = path.join(tempDir, `${document.id}_${req.file.originalname}`);
      fs.writeFileSync(filePath, req.file.buffer);

      return res.status(200).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Ошибка загрузки файла" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      return res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return res.status(500).json({ error: "Ошибка при получении списка документов" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Некорректный ID документа" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      return res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      return res.status(500).json({ error: "Ошибка при получении документа" });
    }
  });

  // Process document
  app.post("/api/documents/:id/process", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Некорректный ID документа" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      // Validate processing options
      const optionsSchema = z.object({
        analyze: z.boolean().optional().default(true),
        format: z.boolean().optional().default(true),
        grammar: z.boolean().optional().default(true),
      });

      const options = optionsSchema.parse(req.body.options);

      // Process text based on selected options
      let analysisResults = null;
      
      if (options.analyze || options.grammar) {
        // Analyze text using OpenAI
        analysisResults = await analyzeText(document.originalText);
        
        // Save analysis results to document
        await storage.updateDocumentAnalysis(documentId, analysisResults);
      }

      return res.json(analysisResults);
    } catch (error) {
      console.error("Error processing document:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Ошибка при обработке документа" });
    }
  });

  // Get analysis results
  app.get("/api/documents/:id/analysis", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Некорректный ID документа" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      if (!document.analysisResults) {
        return res.status(404).json({ error: "Анализ для данного документа не найден" });
      }

      return res.json(document.analysisResults);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      return res.status(500).json({ error: "Ошибка при получении результатов анализа" });
    }
  });

  // Apply changes to document
  app.post("/api/documents/:id/apply-changes", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Некорректный ID документа" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      if (!document.analysisResults) {
        return res.status(400).json({ error: "Сначала необходимо проанализировать документ" });
      }

      // Improve text using OpenAI based on analysis results
      const improvedText = await improveText(document.originalText, document.analysisResults);

      // Update document with improved text
      await storage.updateDocumentText(documentId, improvedText);

      return res.json({ success: true });
    } catch (error) {
      console.error("Error applying changes:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Ошибка при применении изменений" });
    }
  });

  // Format document according to GOST
  app.post("/api/documents/:id/format", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Некорректный ID документа" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      // Get formatting options from request
      const { formatOptions, presetName } = req.body;

      // Save formatting options to document
      await storage.updateDocumentFormatting(documentId, { 
        options: formatOptions, 
        presetName 
      });

      // Apply formatting using OpenAI or other service
      // In a real implementation, this would actually format the document
      // For now, we'll just return success

      return res.json({ success: true });
    } catch (error) {
      console.error("Error formatting document:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Ошибка при форматировании документа" });
    }
  });

  // Download document
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Некорректный ID документа" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Документ не найден" });
      }

      // In a real implementation, this would generate a properly formatted document
      // For now, we'll just return the processed text as a DOCX file
      const text = document.processedText || document.originalText;
      
      // Create a simple DOCX file with the text
      const docxContent = await processDocument(text, document.formattingOptions);
      
      // Set headers for file download
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${document.fileName.replace(/\.[^/.]+$/, "")}_processed.docx"`);
      
      return res.send(docxContent);
    } catch (error) {
      console.error("Error downloading document:", error);
      return res.status(500).json({ error: error instanceof Error ? error.message : "Ошибка при скачивании документа" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
