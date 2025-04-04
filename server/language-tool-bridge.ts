import { spawn } from 'child_process';
import { AnalysisResult } from './openai-service';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, 'language-tool.py');

/**
 * Мост между NodeJS и Python для использования LanguageTool
 */
export class LanguageToolBridge {
  /**
   * Проверяет текст на грамматические ошибки с помощью LanguageTool
   * @param text Текст для проверки
   * @returns Список найденных ошибок с предложениями исправлений
   */
  async checkText(text: string): Promise<AnalysisResult[]> {
    try {
      console.log('LanguageTool checking text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      console.log('Using Python script at:', SCRIPT_PATH);
      
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [SCRIPT_PATH]);
        let resultData = '';
        let errorData = '';

        // Отправляем текст в Python-процесс
        pythonProcess.stdin.write(text);
        pythonProcess.stdin.end();

        // Получаем результаты
        pythonProcess.stdout.on('data', (data) => {
          resultData += data.toString();
          console.log('LanguageTool output:', data.toString().substring(0, 200) + (data.toString().length > 200 ? '...' : ''));
        });

        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
          // Печатаем, но не считаем ошибкой, т.к. stderr также используется для отладочной информации
          console.log('LanguageTool debug info:', data.toString());
        });

        pythonProcess.on('close', (code) => {
          console.log(`LanguageTool process exited with code ${code}`);
          
          if (code !== 0) {
            console.error(`LanguageTool process exited with error code ${code}: ${errorData}`);
            // Если есть ошибка, но нет данных для парсинга, возвращаем пустой результат вместо исключения
            if (!resultData.trim()) {
              console.log('No output from LanguageTool, returning empty result set');
              return resolve([]);
            }
          }

          try {
            // Если есть данные, пытаемся их обработать, даже если был ненулевой код возврата
            if (resultData.trim()) {
              const results = JSON.parse(resultData);
              console.log(`Successfully parsed ${results.length} results from LanguageTool`);
              return resolve(results);
            } else {
              console.log('Empty output from LanguageTool, returning empty result set');
              return resolve([]);
            }
          } catch (err) {
            console.error('Failed to parse LanguageTool results:', resultData);
            console.error('Parse error:', err instanceof Error ? err.message : String(err));
            // Возвращаем пустой массив вместо исключения
            return resolve([]);
          }
        });
      });
    } catch (err) {
      console.error('LanguageTool critical error:', err);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }
}

export default new LanguageToolBridge();