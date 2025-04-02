import { Logo } from "@/components/ui/logo";
import { Link } from "wouter";
import { FaVk, FaTelegram, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mt-4 text-slate-400 max-w-md">
              Сервис для автоматического анализа, улучшения и форматирования школьных эссе и проектов
              по ГОСТу.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="ВКонтакте"
              >
                <FaVk className="text-xl" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <FaTelegram className="text-xl" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Сервис</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-slate-400 hover:text-white transition-colors">Главная</a>
                </Link>
              </li>
              <li>
                <Link href="/analysis">
                  <a className="text-slate-400 hover:text-white transition-colors">
                    Анализ текста
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/formatting">
                  <a className="text-slate-400 hover:text-white transition-colors">
                    Форматирование
                  </a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Тарифы
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-slate-400 hover:text-white transition-colors">О нас</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Как это работает
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Контакты
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Политика конфиденциальности
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Переоформляшка. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
