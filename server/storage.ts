import { users, type User, type InsertUser } from "@shared/schema";
import type { DocumentAnalysisResults, FormatOptions } from "@/lib/types";

// Define Document type
export interface Document {
  id: number;
  fileName: string;
  originalText: string;
  processedText?: string;
  originalType: string;
  createdAt: string;
  analysisResults?: DocumentAnalysisResults;
  formattingOptions?: { options: FormatOptions; presetName: string };
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: Omit<Document, 'id'>): Promise<Document>;
  updateDocumentText(id: number, text: string): Promise<Document | undefined>;
  updateDocumentAnalysis(id: number, analysisResults: DocumentAnalysisResults): Promise<Document | undefined>;
  updateDocumentFormatting(id: number, formattingOptions: { options: FormatOptions; presetName: string }): Promise<Document | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private userCurrentId: number;
  private documentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.userCurrentId = 1;
    this.documentCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(doc: Omit<Document, 'id'>): Promise<Document> {
    const id = this.documentCurrentId++;
    const document: Document = { ...doc, id };
    this.documents.set(id, document);
    return document;
  }

  async updateDocumentText(id: number, text: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, processedText: text };
    this.documents.set(id, updated);
    return updated;
  }

  async updateDocumentAnalysis(id: number, analysisResults: DocumentAnalysisResults): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, analysisResults };
    this.documents.set(id, updated);
    return updated;
  }

  async updateDocumentFormatting(id: number, formattingOptions: { options: FormatOptions; presetName: string }): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, formattingOptions };
    this.documents.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
