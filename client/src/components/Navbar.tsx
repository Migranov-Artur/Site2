import { useState } from "react";
import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-silver-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Logo />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <h1 className="text-xl font-bold text-primary-700 ml-4">
                Переоформляшка
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link href="/analysis" className="text-slate-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                Загрузить файл
              </Link>
              <Link href="/text-check" className="text-slate-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                Проверить текст
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                О сервисе
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Открыть меню</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <div className="flex items-center px-4 py-2">
              <h2 className="text-lg font-bold text-primary-700">
                Переоформляшка
              </h2>
            </div>
            <Link href="/analysis" className="block px-4 py-2 text-base font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50">
              Загрузить файл
            </Link>
            <Link href="/text-check" className="block px-4 py-2 text-base font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50">
              Проверить текст
            </Link>
            <Link href="/about" className="block px-4 py-2 text-base font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50">
              О сервисе
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
