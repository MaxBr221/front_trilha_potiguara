import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary dark:text-primary font-bold text-xl">
          <Image src="/images/logo-potiguara.jpg" alt="Logo" width={24} height={24} className="w-6 h-6 rounded-full shadow-sm object-cover" />
          <span>Tupi Digital</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full transition-colors">
            Entrar
          </Link>

        </div>
      </div>
    </nav>
  );
}
