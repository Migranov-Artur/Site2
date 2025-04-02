import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import ProcessingOptions from "@/components/ProcessingOptions";
import AnalysisResults from "@/components/AnalysisResults";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { DocumentAnalysisResults } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export default function Analysis() {
  const [documentId, setDocumentId] = useState<number>();
  const [analysisResults, setAnalysisResults] = useState<DocumentAnalysisResults>();
  const { toast } = useToast();

  // Fetch analysis results if we have a documentId and no results yet
  const { data: fetchedResults, isLoading } = useQuery({
    queryKey: documentId ? [`/api/documents/${documentId}/analysis`] : ["no-document"],
    enabled: !!documentId && !analysisResults,
    queryFn: async () => {
      if (!documentId) return null;
      const response = await fetch(`/api/documents/${documentId}/analysis`, {
        credentials: "include",
      });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Update results when fetched
  if (fetchedResults && !analysisResults) {
    setAnalysisResults(fetchedResults);
  }

  const handleFileUploaded = (id: number) => {
    setDocumentId(id);
  };

  const handleProcessingComplete = (result: DocumentAnalysisResults) => {
    setAnalysisResults(result);
  };

  const handleApplyChanges = () => {
    toast({
      title: "Изменения применены",
      description: "Все рекомендации успешно применены к документу",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Документ скачан",
      description: "Документ успешно загружен на ваше устройство",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Анализ и улучшение документа</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            Загрузите документ для анализа и получите рекомендации по его улучшению
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-neomorphic-sm">
            <CardHeader>
              <CardTitle>Загрузите документ</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </CardContent>
          </Card>

          <AnalysisResults
            documentId={documentId}
            results={analysisResults}
            onApplyChanges={handleApplyChanges}
            onDownload={handleDownload}
          />
        </div>

        <div>
          <ProcessingOptions
            documentId={documentId}
            onProcessingComplete={handleProcessingComplete}
          />
        </div>
      </div>
    </div>
  );
}
