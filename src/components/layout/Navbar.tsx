import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary dark:text-primary font-bold text-xl">
          <Leaf className="w-6 h-6 text-primary dark:text-primary" />
          <span>Tupi Digital</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-primary dark:hover:text-primary transition-colors">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            Começar Gratuitamente
          </Link>
        </div>
      </div>
    </nav>
  );
}
