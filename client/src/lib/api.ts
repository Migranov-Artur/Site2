import { apiRequest } from "@/lib/queryClient";
import type { DocumentFile, DocumentAnalysisResults, FormatOptions, ProcessingOptions } from "@/lib/types";

export const uploadDocument = async (file: File): Promise<DocumentFile> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const getDocuments = async (): Promise<DocumentFile[]> => {
  const response = await fetch("/api/documents", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const getDocument = async (id: number): Promise<DocumentFile> => {
  const response = await fetch(`/api/documents/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const processDocument = async (
  id: number,
  options: ProcessingOptions
): Promise<DocumentAnalysisResults> => {
  const response = await apiRequest("POST", `/api/documents/${id}/process`, { options });
  return await response.json();
};

export const applyChanges = async (id: number): Promise<void> => {
  await apiRequest("POST", `/api/documents/${id}/apply-changes`, {});
};

export const formatDocument = async (
  id: number,
  formatOptions: FormatOptions,
  presetName: string
): Promise<void> => {
  await apiRequest("POST", `/api/documents/${id}/format`, {
    formatOptions,
    presetName,
  });
};

export const downloadDocument = async (id: number): Promise<Blob> => {
  const response = await fetch(`/api/documents/${id}/download`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.blob();
};
