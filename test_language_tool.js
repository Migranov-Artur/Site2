// Тестовый скрипт для проверки LanguageTool интеграции
import fs from 'fs';
import { analyzeText } from './server/openai-service.js';

// Функция для выполнения теста
async function runTest() {
  try {
    console.log('Чтение тестового файла...');
    const testText = fs.readFileSync('./test_text.txt', 'utf8');
    console.log(`Тестовый текст: "${testText}"`);
    
    console.log('\nВыполнение анализа текста...');
    const results = await analyzeText(testText);
    
    console.log('\nРезультаты анализа:');
    console.log('Грамматика:');
    if (results.grammar.length === 0) {
      console.log('  Грамматических ошибок не найдено');
    } else {
      results.grammar.forEach((issue, index) => {
        console.log(`  ${index + 1}. Оригинал: "${issue.original}"`);
        console.log(`     Исправление: "${issue.improved}"`);
        console.log(`     Объяснение: ${issue.explanation}`);
        console.log(`     Серьезность: ${issue.severity}`);
      });
    }
    
    console.log('\nСтиль:');
    if (results.style.length === 0) {
      console.log('  Стилистических проблем не найдено');
    } else {
      results.style.forEach((issue, index) => {
        console.log(`  ${index + 1}. Оригинал: "${issue.original}"`);
        console.log(`     Исправление: "${issue.improved}"`);
        console.log(`     Объяснение: ${issue.explanation}`);
        console.log(`     Серьезность: ${issue.severity}`);
      });
    }
    
    console.log('\nСтруктура:');
    if (results.structure.length === 0) {
      console.log('  Проблем со структурой не найдено');
    } else {
      results.structure.forEach((issue, index) => {
        console.log(`  ${index + 1}. Оригинал: "${issue.original}"`);
        console.log(`     Исправление: "${issue.improved}"`);
        console.log(`     Объяснение: ${issue.explanation}`);
        console.log(`     Серьезность: ${issue.severity}`);
      });
    }
    
    console.log('\nСводка:');
    console.log('  ' + results.summary);
    
  } catch (error) {
    console.error('Ошибка при выполнении теста:', error);
  }
}

// Запуск теста
runTest();