import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/analysis", label: "Анализ и улучшение" },
    { href: "/formatting", label: "Форматирование" },
    { href: "/about", label: "О нас" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b border-silver-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a>
                  <Logo />
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`${
                      isActive(link.href)
                        ? "border-primary-500 text-silver-900"
                        : "border-transparent text-silver-500 hover:border-silver-300 hover:text-silver-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="default">Войти</Button>
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
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={`${
                    isActive(link.href)
                      ? "bg-primary-50 border-primary-500 text-primary-700"
                      : "border-transparent text-silver-500 hover:bg-silver-50 hover:border-silver-300 hover:text-silver-700"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-silver-200">
            <div className="flex items-center px-4">
              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Войти
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
