import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Download, RefreshCw, FileType } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalysisResult {
  original: string;
  improved: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface AnalysisResultsProps {
  documentId?: number;
  results?: {
    grammar: AnalysisResult[];
    style: AnalysisResult[];
    structure: AnalysisResult[];
    summary: string;
  };
  onDownload?: () => void;
  onApplyChanges?: () => void;
}

export default function AnalysisResults({
  documentId,
  results,
  onDownload,
  onApplyChanges,
}: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("grammar");
  const [isApplying, setIsApplying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [exportFormat, setExportFormat] = useState("docx");
  const { toast } = useToast();

  if (!results) {
    return (
      <Card className="mt-8 shadow-neomorphic-sm">
        <CardContent className="pt-6 text-center">
          <p className="text-slate-500">Здесь будут отображены результаты анализа документа</p>
        </CardContent>
      </Card>
    );
  }

  const handleApplyChanges = async () => {
    if (!documentId) return;
    
    setIsApplying(true);
    
    try {
      await apiRequest("POST", `/api/documents/${documentId}/apply-changes`, {});
      
      toast({
        title: "Изменения применены",
        description: "Все рекомендации успешно применены к документу",
      });
      
      if (onApplyChanges) {
        onApplyChanges();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось применить изменения",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownload = async () => {
    if (!documentId) return;
    
    setIsDownloading(true);
    
    try {
      // Добавляем параметр format в URL
      const response = await fetch(`/api/documents/${documentId}/download?format=${exportFormat}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to download document");
      }
      
      // Get filename from Content-Disposition header or use a default name
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `document.${exportFormat}`;
      
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
        description: `Документ успешно загружен в формате ${exportFormat.toUpperCase()}`,
      });
      
      if (onDownload) {
        onDownload();
      }
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

  // Map severity to appropriate styling
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        };
      case "medium":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          textColor: "text-amber-800",
        };
      case "low":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <Card className="shadow-neomorphic">
        <CardHeader>
          <CardTitle className="text-xl">Результаты анализа</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <Alert className="mb-6 bg-primary-50 border-primary-200">
            <AlertTitle className="text-primary-800">Общая оценка</AlertTitle>
            <AlertDescription className="text-primary-700">
              {results.summary}
            </AlertDescription>
          </Alert>

          {/* Tabs for different categories */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="grammar">Грамматика</TabsTrigger>
              <TabsTrigger value="style">Стиль</TabsTrigger>
              <TabsTrigger value="structure">Структура</TabsTrigger>
            </TabsList>

            {/* Grammar content */}
            <TabsContent value="grammar" className="space-y-4">
              {results.grammar.length > 0 ? (
                results.grammar.map((item, index) => {
                  const styles = getSeverityStyles(item.severity);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${styles.borderColor} ${styles.bgColor} ${styles.textColor}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">{styles.icon}</div>
                        <div>
                          <p className="font-medium">Оригинал: "{item.original}"</p>
                          <p className="mt-1">Рекомендация: "{item.improved}"</p>
                          <p className="mt-2 text-sm opacity-80">{item.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-500">Грамматических проблем не обнаружено</p>
              )}
            </TabsContent>

            {/* Style content */}
            <TabsContent value="style" className="space-y-4">
              {results.style.length > 0 ? (
                results.style.map((item, index) => {
                  const styles = getSeverityStyles(item.severity);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${styles.borderColor} ${styles.bgColor} ${styles.textColor}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">{styles.icon}</div>
                        <div>
                          <p className="font-medium">Оригинал: "{item.original}"</p>
                          <p className="mt-1">Рекомендация: "{item.improved}"</p>
                          <p className="mt-2 text-sm opacity-80">{item.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-500">Стилистических проблем не обнаружено</p>
              )}
            </TabsContent>

            {/* Structure content */}
            <TabsContent value="structure" className="space-y-4">
              {results.structure.length > 0 ? (
                results.structure.map((item, index) => {
                  const styles = getSeverityStyles(item.severity);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${styles.borderColor} ${styles.bgColor} ${styles.textColor}`}
                    >
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">{styles.icon}</div>
                        <div>
                          <p className="font-medium">Оригинал: "{item.original}"</p>
                          <p className="mt-1">Рекомендация: "{item.improved}"</p>
                          <p className="mt-2 text-sm opacity-80">{item.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-slate-500">Структурных проблем не обнаружено</p>
              )}
            </TabsContent>
          </Tabs>

          {/* Format selector */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileType className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Формат экспорта:</span>
              </div>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Выберите формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleApplyChanges}
              className="flex-1"
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Применение...
                </>
              ) : (
                "Применить изменения"
              )}
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1"
              variant="outline"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Скачать документ ({exportFormat.toUpperCase()})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
