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
        });

        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`LanguageTool process exited with code ${code}: ${errorData}`));
          }

          try {
            const results = JSON.parse(resultData);
            resolve(results);
          } catch (err) {
            reject(new Error(`Failed to parse LanguageTool results: ${err instanceof Error ? err.message : String(err)}`));
          }
        });
      });
    } catch (err) {
      console.error('LanguageTool error:', err);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }
}

export default new LanguageToolBridge();