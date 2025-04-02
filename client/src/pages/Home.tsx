import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Info, Upload, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-10 bg-fixed" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Переоформляшка
              </h1>
              <p className="mt-3 text-xl text-primary-100">
                Ваш помощник в исправлении текстов
              </p>
              <p className="mt-5 text-lg max-w-xl">
                Автоматический анализ, улучшение и форматирование школьных эссе и проектов по ГОСТу.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/analysis">
                  <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                    <Upload className="mr-2 h-5 w-5" />
                    Загрузить документ
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-primary-700 bg-opacity-50 hover:bg-opacity-70 text-white border-primary-400"
                  >
                    <Info className="mr-2 h-5 w-5" />
                    Узнать больше
                  </Button>
                </Link>
              </div>
              <div className="mt-12 inline-block rounded-lg px-4 py-2 bg-primary-100 bg-opacity-20 border border-primary-300 border-opacity-30 text-sm backdrop-blur">
                <span className="font-semibold tracking-wide uppercase text-primary-100">
                  [Переоформление]
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              {/* Decorative illustration */}
              <div className="w-full h-96 relative">
                <div className="absolute top-0 right-0 w-80 h-80 bg-slate-100 rounded-2xl shadow-neomorphic flex items-center justify-center rotate-6 transform-gpu opacity-90">
                  <div className="w-72 h-72 bg-white rounded-xl p-6">
                    <div className="w-16 h-6 bg-primary-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-slate-200 rounded"></div>
                      <div className="w-5/6 h-3 bg-slate-200 rounded"></div>
                      <div className="w-4/6 h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-8 w-16 h-6 bg-primary-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-slate-200 rounded"></div>
                      <div className="w-5/6 h-3 bg-slate-200 rounded"></div>
                      <div className="w-4/6 h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <div className="w-24 h-8 bg-primary-300 rounded-md"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-10 w-64 h-64 bg-slate-100 rounded-2xl shadow-neomorphic flex items-center justify-center -rotate-6 transform-gpu opacity-90">
                  <div className="w-56 h-56 bg-white rounded-xl p-6">
                    <div className="w-16 h-6 bg-primary-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-slate-200 rounded"></div>
                      <div className="w-5/6 h-3 bg-slate-200 rounded"></div>
                      <div className="w-4/6 h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="w-full h-3 bg-primary-100 rounded"></div>
                      <div className="w-5/6 h-3 bg-primary-100 rounded"></div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <div className="w-24 h-8 bg-primary-300 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Наши возможности</h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Улучшайте ваши тексты и форматируйте документы по ГОСТу с помощью искусственного
              интеллекта
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl p-8 shadow-neomorphic-sm hover:shadow-neomorphic transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m16 6 4 14"></path>
                  <path d="M12 6v14"></path>
                  <path d="M8 8v12"></path>
                  <path d="M4 4v16"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Анализ и улучшение</h3>
              <p className="text-slate-600">
                Автоматически находим ошибки, неточности и стилистические проблемы в тексте и предлагаем
                варианты улучшения.
              </p>
              <Link href="/analysis">
                <a className="inline-flex items-center mt-4 text-primary-600 font-medium">
                  Подробнее <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl p-8 shadow-neomorphic-sm hover:shadow-neomorphic transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Форматирование по ГОСТу</h3>
              <p className="text-slate-600">
                Автоматическое форматирование документов согласно выбранным стандартам ГОСТа для учебных
                работ.
              </p>
              <Link href="/formatting">
                <a className="inline-flex items-center mt-4 text-primary-600 font-medium">
                  Подробнее <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-xl p-8 shadow-neomorphic-sm hover:shadow-neomorphic transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Экспорт документов</h3>
              <p className="text-slate-600">
                Скачивайте улучшенные и отформатированные документы в форматах PDF, DOCX и других
                популярных форматах.
              </p>
              <Link href="/analysis">
                <a className="inline-flex items-center mt-4 text-primary-600 font-medium">
                  Подробнее <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Как это работает</h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Простой процесс в три шага для улучшения ваших документов
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 transform-gpu"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-600 text-xl font-bold border-4 border-primary-100 shadow-neomorphic-sm">
                    1
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">Загрузите документ</h3>
                  <p className="mt-2 text-center text-slate-600">
                    Загрузите файл в формате PDF, Word или текстовый документ
                  </p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-600 text-xl font-bold border-4 border-primary-100 shadow-neomorphic-sm">
                    2
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">Выберите опции</h3>
                  <p className="mt-2 text-center text-slate-600">
                    Укажите какие улучшения и форматирование требуется
                  </p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-600 text-xl font-bold border-4 border-primary-100 shadow-neomorphic-sm">
                    3
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">Получите результат</h3>
                  <p className="mt-2 text-center text-slate-600">
                    Скачайте улучшенный документ или примените рекомендации
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Готовы улучшить свой документ?</h2>
          <p className="mt-4 text-xl max-w-2xl mx-auto text-primary-100">
            Начните использовать сервис прямо сейчас — быстро, удобно и эффективно
          </p>
          <div className="mt-8">
            <Link href="/analysis">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                Загрузить документ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
