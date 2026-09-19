'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Book, Volume2 } from 'lucide-react';
import { servicoDicionario, ConteudoLinguistico } from '@/services/servicoDicionario';

export default function DicionarioPage() {
  const [palavras, setPalavras] = useState<ConteudoLinguistico[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    servicoDicionario.listarTodos()
      .then(setPalavras)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const palavrasFiltradas = palavras.filter(p => {
    const termo = busca.toLowerCase();
    return p.palavraTupi.toLowerCase().includes(termo) || 
           p.traducaoPtBr.toLowerCase().includes(termo);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4">
          <Book className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Dicionário Tupi-Português</h1>
        <p className="text-stone-600 max-w-lg mb-6">
          Pesquise por palavras em Tupi ou suas traduções em Português para expandir seu vocabulário.
        </p>
        
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Buscar palavra..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone-200 bg-white text-stone-800 placeholder:text-stone-400 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-lg"
          />
        </div>
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {palavrasFiltradas.length > 0 ? (
            palavrasFiltradas.map(palavra => (
              <div key={palavra.id} className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-primary/50 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-primary group-hover:text-primary-600 transition-colors">
                    {palavra.palavraTupi}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-stone-100 text-stone-500 rounded">
                    {palavra.tipo}
                  </span>
                </div>
                <p className="text-stone-700 font-medium mb-3">{palavra.traducaoPtBr}</p>
                
                {palavra.fonetica && (
                  <div className="flex items-center gap-2 text-sm text-stone-500 bg-stone-50 px-3 py-2 rounded-lg w-fit">
                    <Volume2 className="w-4 h-4 text-stone-400" />
                    <span>/{palavra.fonetica}/</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-stone-500">
              Nenhuma palavra encontrada para &quot;{busca}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
