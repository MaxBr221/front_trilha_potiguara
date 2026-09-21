'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Book, Copy, Check, Volume2 } from 'lucide-react';
import { servicoDicionario, ConteudoLinguistico } from '@/services/servicoDicionario';

export default function DicionarioPage() {
  const [palavras, setPalavras] = useState<ConteudoLinguistico[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState('');

  const tocarAudioTupi = (palavraTupi: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita copiar a palavra ao clicar no som
    window.speechSynthesis.cancel();
    
    // Remove o apóstrofo (e outros caracteres que pausam a voz) para que o motor leia a palavra inteira
    const palavraSanitizada = palavraTupi.replace(/['´`]/g, '');

    const fala = new SpeechSynthesisUtterance(palavraSanitizada);
    fala.lang = 'pt-BR';
    fala.rate = 0.9;
    fala.pitch = 1.0;
    window.speechSynthesis.speak(fala);
  };

  useEffect(() => {
    servicoDicionario.listarTodos()
      .then((dados) => {
        const processadas: ConteudoLinguistico[] = [];
        const vistas = new Set<string>();

        dados.forEach(item => {
          const palavras = item.palavraTupi.split(',').map(p => p.trim()).filter(Boolean);
          
          palavras.forEach(p => {
            const idNormalizada = p.toLowerCase();
            if (!vistas.has(idNormalizada)) {
              vistas.add(idNormalizada);
              processadas.push({
                ...item,
                id: processadas.length > 0 ? `${item.id}-${p}` : item.id,
                palavraTupi: p
              });
            }
          });
        });

        setPalavras(processadas);
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const removerAcentos = (texto: string) => {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const palavrasFiltradas = palavras.filter(p => {
    const termo = removerAcentos(busca);
    return removerAcentos(p.palavraTupi).includes(termo) || 
           removerAcentos(p.traducaoPtBr).includes(termo);
  });

  const copiarPalavra = (palavra: string) => {
    navigator.clipboard.writeText(palavra);
    setToast(`"${palavra}" copiado!`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 relative">
      
      {toast && (
        <div className="fixed top-20 right-8 bg-stone-800 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="font-bold">{toast}</span>
        </div>
      )}

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
              <div 
                key={palavra.id} 
                className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-primary/50 hover:shadow-md transition-all group relative cursor-pointer"
                onClick={() => copiarPalavra(palavra.palavraTupi)}
                title="Clique para copiar"
              >
                <div className="absolute top-4 right-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy className="w-5 h-5 hover:text-primary" />
                </div>
                
                <div className="flex justify-between items-start mb-2 pr-8">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-primary group-hover:text-primary-600 transition-colors">
                      {palavra.palavraTupi}
                    </h3>
                    <button 
                      onClick={(e) => tocarAudioTupi(palavra.palavraTupi, e)}
                      className="p-1.5 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Ouvir pronúncia"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-stone-100 text-stone-500 rounded">
                    {palavra.tipo}
                  </span>
                </div>
                <p className="text-stone-700 font-medium mb-3">{palavra.traducaoPtBr}</p>
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
