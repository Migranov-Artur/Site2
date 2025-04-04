import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">О нашем сервисе</h1>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
            Узнайте больше о том, как наш сервис помогает студентам и преподавателям
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-slate-900">Наша миссия</h2>
          <p className="mt-4 text-lg text-slate-600">
            <span className="font-semibold text-primary-600">Переоформляшка</span> — это
            инновационный сервис, разработанный для помощи студентам и учащимся в оформлении
            академических работ.
          </p>
          <p className="mt-4 text-slate-600">
            Наша цель — сделать процесс оформления документов по ГОСТу простым и доступным, чтобы вы
            могли сосредоточиться на содержании своей работы, не беспокоясь о форматировании.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <p className="ml-3 text-slate-600">Экономия времени на оформлении документов</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <p className="ml-3 text-slate-600">Улучшение качества текста и его восприятия</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <p className="ml-3 text-slate-600">
                Соответствие всем требованиям ГОСТа и учебного заведения
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <CheckCircle className="h-4 w-4" />
              </div>
              <p className="ml-3 text-slate-600">Исправление грамматических и стилистических ошибок</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative h-96 lg:h-auto"
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-primary-100 rounded-2xl shadow-neomorphic flex items-center justify-center rotate-6 transform-gpu opacity-60"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-slate-100 rounded-2xl shadow-neomorphic flex items-center justify-center -rotate-3 transform-gpu overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 opacity-90 flex items-center justify-center">
              <div className="text-white text-center p-6">
                <h3 className="text-2xl font-bold mb-4">Технологии будущего</h3>
                <p>
                  Мы используем передовые алгоритмы искусственного интеллекта для анализа и улучшения
                  ваших текстов
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 right-20 w-48 h-48 bg-white rounded-2xl shadow-neomorphic flex items-center justify-center rotate-12 transform-gpu">
            <div className="w-16 h-16 text-primary-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Секция отзывов пользователей удалена */}
    </div>
  );
}
