import Link from 'next/link';
import { ArrowRight, Leaf, Map, Trophy, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-4 py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Leaf className="w-4 h-4" />
            <span>Redescubra nossas raízes</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mb-6">
            Aprenda Tupi. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
              Valorize a cultura.
            </span>
          </h1>
          
          <p className="text-xl text-stone-600 dark:text-stone-300 mb-10 max-w-2xl leading-relaxed">
            Uma plataforma interativa, dinâmica e gameficada para você aprender a língua Tupi e se conectar com o conhecimento e a história indígena do Brasil.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-primary/25"
            >
              Começar a aprender
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-stone-50 dark:bg-stone-900/50 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Como funciona o Tupi Digital?</h2>
              <p className="text-stone-600 dark:text-stone-300 text-lg max-w-2xl mx-auto">Muito mais que um aplicativo de idiomas, uma jornada de imersão e aprendizado progressoivo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <Map className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-800 dark:text-stone-100">Trilhas de Aprendizado</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">Siga caminhos estruturados que vão desde o básico até conversações mais complexas. Evolua no seu próprio ritmo.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-800 dark:text-stone-100">Contexto Cultural</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">Aprenda não apenas palavras, mas a história, as tradições e a visão de mundo por trás de cada expressão.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-800 dark:text-stone-100">Gamificação Divertida</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">Ganhe experiência, suba de nível e mantenha sua sequência de estudos para se motivar todos os dias.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl mb-4">
            <Leaf className="w-6 h-6 text-primary" />
            <span>Tupi Digital</span>
          </div>
          <p className="text-stone-500 dark:text-stone-400 mb-6">Desenvolvido para valorizar a língua e cultura indígena.</p>
          
          <div className="flex flex-col items-center justify-center pt-6 border-t border-stone-100 dark:border-stone-800">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 text-center">Desenvolvido por</p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 w-full">
              <a 
                href="https://www.instagram.com/_maxsueel?stkn=MW9vbHFkbWh5dWEzdw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-[#E1306C] transition-colors bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-full font-medium text-sm border border-stone-200 dark:border-stone-700"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                @_maxsueel
              </a>
              <a 
                href="https://www.linkedin.com/in/maxsuel-lima-5a27a635b/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-[#0a66c2] transition-colors bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-full font-medium text-sm border border-stone-200 dark:border-stone-700"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                Maxsuel Lima
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
