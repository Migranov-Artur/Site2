import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import FormatSettings from "@/components/FormatSettings";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Formatting() {
  const [documentId, setDocumentId] = useState<number>();
  const [isFormatted, setIsFormatted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleFileUploaded = (id: number) => {
    setDocumentId(id);
    setIsFormatted(false);
  };

  const handleFormatApplied = () => {
    setIsFormatted(true);
  };

  const handleDownload = async () => {
    if (!documentId) return;
    
    setIsDownloading(true);
    
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to download document");
      }
      
      // Get filename from Content-Disposition header or use a default name
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "document.docx";
      
      // Create blob from response
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Документ скачан",
        description: "Отформатированный документ успешно загружен на ваше устройство",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скачать документ",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Форматирование по ГОСТу</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            Загрузите документ и выберите стандарт ГОСТ для автоматического форматирования
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

          {isFormatted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <Card className="shadow-neomorphic">
                <CardHeader>
                  <CardTitle>Форматирование выполнено</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-primary-500" />
                      <p className="mt-4 text-lg font-medium text-slate-900">
                        Документ успешно отформатирован по ГОСТу
                      </p>
                      <p className="mt-2 text-slate-500">
                        Вы можете скачать готовый документ в формате DOCX
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full"
                    disabled={isDownloading}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {isDownloading ? "Загрузка документа..." : "Скачать отформатированный документ"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div>
          <FormatSettings documentId={documentId} onFormatApplied={handleFormatApplied} />
        </div>
      </div>
    </div>
  );
}
