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
          
          <p className="text-xl text-stone-600 mb-10 max-w-2xl leading-relaxed">
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
            <Link
              href="/sobre"
              className="inline-flex items-center justify-center gap-2 bg-white text-foreground border border-stone-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-stone-50 transition-all"
            >
              Conheça o projeto
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-stone-50 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Como funciona o Tupi Digital?</h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">Muito mais que um aplicativo de idiomas, uma jornada de imersão e aprendizado progressoivo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6">
                  <Map className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trilhas de Aprendizado</h3>
                <p className="text-stone-600 leading-relaxed">Siga caminhos estruturados que vão desde o básico até conversações mais complexas. Evolua no seu próprio ritmo.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Contexto Cultural</h3>
                <p className="text-stone-600 leading-relaxed">Aprenda não apenas palavras, mas a história, as tradições e a visão de mundo por trás de cada expressão.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gamificação Divertida</h3>
                <p className="text-stone-600 leading-relaxed">Ganhe experiência, suba de nível e mantenha sua sequência de estudos para se motivar todos os dias.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-stone-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl mb-4">
            <Leaf className="w-6 h-6 text-primary" />
            <span>Tupi Digital</span>
          </div>
          <p className="text-stone-500">Desenvolvido para valorizar a língua e cultura indígena.</p>
        </div>
      </footer>
    </div>
  );
}
