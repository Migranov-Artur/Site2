export interface DocumentFile {
  id: number;
  fileName: string;
  originalType: string;
  createdAt: string;
}

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

export interface FormatOptions {
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  pageMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  citationStyle: string;
  headingStyles: {
    level1: {
      fontSize: number;
      fontWeight: string;
      alignment: string;
    };
    level2: {
      fontSize: number;
      fontWeight: string;
      alignment: string;
    };
  };
}

export interface ProcessingOptions {
  analyze: boolean;
  format: boolean;
  grammar: boolean;
}
