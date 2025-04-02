import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Form schema for GOST formatting
const formSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(16),
  lineSpacing: z.number().min(1).max(2.5),
  pageMargins: z.object({
    top: z.number().min(1).max(5),
    right: z.number().min(1).max(5),
    bottom: z.number().min(1).max(5),
    left: z.number().min(1).max(5),
  }),
  citationStyle: z.string(),
  headingStyles: z.object({
    level1: z.object({
      fontSize: z.number().min(12).max(20),
      fontWeight: z.string(),
      alignment: z.string(),
    }),
    level2: z.object({
      fontSize: z.number().min(12).max(20),
      fontWeight: z.string(),
      alignment: z.string(),
    }),
  }),
});

const presetGostOptions = {
  "gost-2008": {
    name: "ГОСТ 7.32-2017",
    fontFamily: "Times New Roman",
    fontSize: 14,
    lineSpacing: 1.5,
    pageMargins: { top: 2, right: 1.5, bottom: 2, left: 3 },
    citationStyle: "gost-2008",
    headingStyles: {
      level1: { fontSize: 16, fontWeight: "bold", alignment: "center" },
      level2: { fontSize: 14, fontWeight: "bold", alignment: "left" },
    },
  },
  "gost-2003": {
    name: "ГОСТ 7.32-2001",
    fontFamily: "Times New Roman",
    fontSize: 14,
    lineSpacing: 1.5,
    pageMargins: { top: 2, right: 1, bottom: 2, left: 3 },
    citationStyle: "gost-2003",
    headingStyles: {
      level1: { fontSize: 16, fontWeight: "bold", alignment: "center" },
      level2: { fontSize: 14, fontWeight: "bold", alignment: "left" },
    },
  },
  "gost-r-7-0-5": {
    name: "ГОСТ Р 7.0.5-2008",
    fontFamily: "Times New Roman",
    fontSize: 14,
    lineSpacing: 1.5,
    pageMargins: { top: 2, right: 1.5, bottom: 2, left: 3 },
    citationStyle: "gost-r-7-0-5",
    headingStyles: {
      level1: { fontSize: 16, fontWeight: "bold", alignment: "center" },
      level2: { fontSize: 15, fontWeight: "bold", alignment: "left" },
    },
  },
  "custom": {
    name: "Пользовательские настройки",
    fontFamily: "Times New Roman",
    fontSize: 14,
    lineSpacing: 1.5,
    pageMargins: { top: 2, right: 1.5, bottom: 2, left: 3 },
    citationStyle: "gost-2008",
    headingStyles: {
      level1: { fontSize: 16, fontWeight: "bold", alignment: "center" },
      level2: { fontSize: 14, fontWeight: "bold", alignment: "left" },
    },
  },
};

interface FormatSettingsProps {
  documentId?: number;
  onFormatApplied?: () => void;
}

export default function FormatSettings({ documentId, onFormatApplied }: FormatSettingsProps) {
  const [preset, setPreset] = useState<string>("gost-2008");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: presetGostOptions["gost-2008"],
  });

  // Update form values when preset changes
  const handlePresetChange = (value: string) => {
    setPreset(value);
    form.reset(presetGostOptions[value as keyof typeof presetGostOptions]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!documentId) {
      toast({
        title: "Ошибка",
        description: "Сначала загрузите документ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", `/api/documents/${documentId}/format`, {
        formatOptions: values,
        presetName: preset,
      });

      toast({
        title: "Форматирование применено",
        description: "Документ успешно отформатирован по выбранному стандарту",
      });

      if (onFormatApplied) {
        onFormatApplied();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось применить форматирование",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-neomorphic">
        <CardHeader>
          <CardTitle>Настройки форматирования по ГОСТу</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Выберите стандарт ГОСТ</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        handlePresetChange(value);
                        field.onChange(presetGostOptions[value as keyof typeof presetGostOptions].fontFamily);
                      }}
                      defaultValue={preset}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите стандарт" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gost-2008">ГОСТ 7.32-2017</SelectItem>
                        <SelectItem value="gost-2003">ГОСТ 7.32-2001</SelectItem>
                        <SelectItem value="gost-r-7-0-5">ГОСТ Р 7.0.5-2008</SelectItem>
                        <SelectItem value="custom">Пользовательские настройки</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Выберите стандарт ГОСТ для форматирования вашего документа
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {preset === "custom" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Шрифт</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите шрифт" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Calibri">Calibri</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Размер шрифта: {field.value}pt</FormLabel>
                          <FormControl>
                            <Slider
                              min={8}
                              max={16}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lineSpacing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Межстрочный интервал: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={2.5}
                              step={0.1}
                              defaultValue={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="citationStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Стиль цитирования</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите стиль цитирования" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gost-2008">ГОСТ 2008</SelectItem>
                              <SelectItem value="gost-2003">ГОСТ 2003</SelectItem>
                              <SelectItem value="gost-r-7-0-5">ГОСТ Р 7.0.5</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Поля страницы (см)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="pageMargins.top"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Верхнее</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                step={0.1}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pageMargins.right"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Правое</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                step={0.1}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pageMargins.bottom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Нижнее</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                step={0.1}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pageMargins.left"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Левое</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                step={0.1}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || !documentId}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Применение...
                  </>
                ) : (
                  "Применить форматирование"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
