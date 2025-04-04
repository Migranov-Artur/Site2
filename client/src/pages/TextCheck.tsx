import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Типы результатов анализа ошибок
interface AnalysisResult {
  original: string;
  improved: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface DocumentAnalysisResults {
  grammar: AnalysisResult[];
  style: AnalysisResult[];
  structure: AnalysisResult[];
  summary: string;
}

export default function TextCheck() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<DocumentAnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Функция для прямой проверки текста
  const checkText = async () => {
    if (!text.trim()) {
      setError("Пожалуйста, введите текст для проверки");
      toast({
        title: "Пустой текст",
        description: "Пожалуйста, введите текст для проверки",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Используем временный файл для тестирования функциональности
      const response = await apiRequest(
        "POST",
        "/api/documents", 
        { 
          text,
          fileName: "text_analysis_test.txt", 
          originalType: "text/plain" 
        }
      );
      
      const document = await response.json();
      
      // Теперь запрашиваем анализ
      const analysisResponse = await apiRequest(
        "POST",
        `/api/documents/${document.id}/process`, 
        { 
          analyze: true,
          format: false,
          grammar: true
        }
      );
      
      const analysisResults = await analysisResponse.json();
      setResults(analysisResults);
      toast({
        title: "Анализ завершен",
        description: "Текст успешно проанализирован",
        variant: "default"
      });
    } catch (err) {
      console.error("Error checking text:", err);
      setError("Ошибка при проверке текста. Пожалуйста, попробуйте еще раз.");
      toast({
        title: "Ошибка",
        description: "Проблема при анализе текста. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Цвет маркера в зависимости от серьезности ошибки
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Проверка текста</h1>
        <p className="text-slate-600 mb-6">
          Введите текст для поиска грамматических и стилистических ошибок
        </p>
        
        <Card className="p-6 shadow-neomorphic-sm mb-8">
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Вставьте текст для проверки..."
            className="min-h-40 mb-6 border-slate-200 focus:border-primary-300 focus:ring-primary-300 shadow-inner text-base p-4 font-medium leading-relaxed"
          />
          
          <div className="flex justify-center">
            <Button 
              onClick={checkText} 
              disabled={loading}
              size="lg"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-8 py-2 shadow-neomorphic-sm hover:shadow-neomorphic-md transition-all duration-300"
            >
              {loading ? "Проверка..." : "Проверить текст"}
            </Button>
          </div>
        </Card>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-slate-900">Результаты анализа</h2>
            
            {results.summary && (
              <Alert className="mb-6 bg-primary-50 border-primary-200 text-primary-800">
                <AlertDescription>{results.summary}</AlertDescription>
              </Alert>
            )}
            
            {/* Грамматические ошибки */}
            {results.grammar.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Грамматические ошибки ({results.grammar.length})</h3>
                <div className="space-y-3">
                  {results.grammar.map((error, index) => (
                    <Card key={`grammar-${index}`} className="p-4 hover:shadow-neomorphic-sm transition-shadow duration-200">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${getSeverityColor(error.severity)}`} />
                        <div className="flex-1">
                          <div className="mb-1 text-red-600 dark:text-red-400 line-through">{error.original}</div>
                          <div className="mb-2 text-green-600 dark:text-green-400 font-medium">{error.improved}</div>
                          <div className="text-sm text-slate-600">{error.explanation}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Стилистические ошибки */}
            {results.style.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Стилистические проблемы ({results.style.length})</h3>
                <div className="space-y-3">
                  {results.style.map((error, index) => (
                    <Card key={`style-${index}`} className="p-4 hover:shadow-neomorphic-sm transition-shadow duration-200">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${getSeverityColor(error.severity)}`} />
                        <div className="flex-1">
                          <div className="mb-1 text-red-600 dark:text-red-400 line-through">{error.original}</div>
                          <div className="mb-2 text-green-600 dark:text-green-400 font-medium">{error.improved}</div>
                          <div className="text-sm text-slate-600">{error.explanation}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Структурные проблемы */}
            {results.structure.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-slate-900">Структурные проблемы ({results.structure.length})</h3>
                <div className="space-y-3">
                  {results.structure.map((error, index) => (
                    <Card key={`structure-${index}`} className="p-4 hover:shadow-neomorphic-sm transition-shadow duration-200">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${getSeverityColor(error.severity)}`} />
                        <div className="flex-1">
                          <div className="mb-1 text-red-600 dark:text-red-400 line-through">{error.original}</div>
                          <div className="mb-2 text-green-600 dark:text-green-400 font-medium">{error.improved}</div>
                          <div className="text-sm text-slate-600">{error.explanation}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {results.grammar.length === 0 && results.style.length === 0 && results.structure.length === 0 && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertTitle className="text-green-600">Текст без ошибок</AlertTitle>
                <AlertDescription className="text-green-700">Проблем не обнаружено. Отличная работа!</AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}