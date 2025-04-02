import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";

interface FileUploadProps {
  onFileUploaded?: (fileId: number) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedTypes = [".pdf", ".docx", ".doc", ".txt"];
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    
    // Validate file type
    if (!allowedMimeTypes.includes(file.type)) {
      setUploadError("Неподдерживаемый формат файла");
      toast({
        title: "Ошибка загрузки",
        description: "Пожалуйста, загрузите файл в формате PDF, DOCX, DOC или TXT",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Файл слишком большой");
      toast({
        title: "Ошибка загрузки",
        description: "Максимальный размер файла - 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      
      // Upload file to server
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const data = await response.json();
      
      setUploadSuccess(true);
      toast({
        title: "Файл загружен",
        description: "Документ успешно загружен и готов к обработке",
      });
      
      // Notify parent component about successful upload
      if (onFileUploaded) {
        onFileUploaded(data.id);
      }
      
      // Invalidate queries to refresh document list
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Ошибка загрузки файла");
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файл. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`mt-8 bg-slate-50 border-2 border-dashed ${
        isDragging ? "border-primary-300 bg-primary-50" : "border-slate-300"
      } ${uploadSuccess ? "border-green-300 bg-green-50" : ""} ${
        uploadError ? "border-red-300 bg-red-50" : ""
      } rounded-xl p-12 text-center hover:border-primary-300 transition-colors cursor-pointer shadow-neomorphic-sm`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto h-20 w-20 text-slate-400 flex items-center justify-center rounded-full bg-slate-100"
        >
          {isUploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <UploadCloud className="h-8 w-8" />
            </motion.div>
          ) : uploadSuccess ? (
            <Check className="h-8 w-8 text-green-500" />
          ) : uploadError ? (
            <AlertCircle className="h-8 w-8 text-red-500" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </motion.div>
        
        <div>
          {uploadSuccess ? (
            <p className="text-xl font-medium text-green-700">Файл загружен</p>
          ) : uploadError ? (
            <p className="text-xl font-medium text-red-700">{uploadError}</p>
          ) : isUploading ? (
            <p className="text-xl font-medium text-slate-900">Загрузка файла...</p>
          ) : (
            <>
              <p className="text-xl font-medium text-slate-900">Перетащите файл сюда</p>
              <p className="text-slate-500 mt-1">или</p>
            </>
          )}
        </div>
        
        {!isUploading && !uploadSuccess && (
          <Button
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            Выбрать файл
          </Button>
        )}
        
        <p className="text-sm text-slate-500">
          Поддерживаемые форматы: PDF, DOCX, DOC, TXT
        </p>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={allowedTypes.join(",")}
        className="hidden"
      />
    </div>
  );
}
