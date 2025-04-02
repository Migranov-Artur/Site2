import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

interface ProcessingOptionsProps {
  documentId?: number;
  onProcessingComplete?: (result: any) => void;
}

export default function ProcessingOptions({ documentId, onProcessingComplete }: ProcessingOptionsProps) {
  const [options, setOptions] = useState({
    analyze: true,
    format: true,
    grammar: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleOptionChange = (option: keyof typeof options, checked: boolean) => {
    setOptions((prev) => ({ ...prev, [option]: checked }));
  };

  const processDocument = async () => {
    if (!documentId) {
      toast({
        title: "Ошибка",
        description: "Сначала загрузите документ",
        variant: "destructive",
      });
      return;
    }

    if (!options.analyze && !options.format && !options.grammar) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одну операцию",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", `/api/documents/${documentId}/process`, {
        options,
      });

      const result = await response.json();

      toast({
        title: "Готово",
        description: "Документ успешно обработан",
      });

      if (onProcessingComplete) {
        onProcessingComplete(result);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обработать документ",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-neomorphic">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Выберите операции</h3>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="analyze"
                checked={options.analyze}
                onCheckedChange={(checked) =>
                  handleOptionChange("analyze", checked as boolean)
                }
              />
              <Label htmlFor="analyze" className="text-slate-700">
                Анализ и улучшение текста
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="format"
                checked={options.format}
                onCheckedChange={(checked) =>
                  handleOptionChange("format", checked as boolean)
                }
              />
              <Label htmlFor="format" className="text-slate-700">
                Форматирование по ГОСТу
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="grammar"
                checked={options.grammar}
                onCheckedChange={(checked) =>
                  handleOptionChange("grammar", checked as boolean)
                }
              />
              <Label htmlFor="grammar" className="text-slate-700">
                Проверка грамматики и пунктуации
              </Label>
            </div>

            <div className="mt-8">
              <Button
                className="w-full"
                size="lg"
                disabled={isProcessing || !documentId}
                onClick={processDocument}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  "Обработать документ"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
