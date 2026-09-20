'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Calendar, LogOut, Shield, Zap, Flame, BookOpen, Loader2, X, Check } from 'lucide-react';
import { useAutenticacao } from '@/contexts/ContextoAutenticacao';
import { servicoDashboard, DashboardData } from '@/services/servicoDashboard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

export default function PerfilPage() {
  const { usuario, logout, atualizarUsuario } = useAutenticacao();
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Estados dos Modais
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);

  // Estados dos Formulários
  const [nomeForm, setNomeForm] = useState('');
  const [fotoPerfilForm, setFotoPerfilForm] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const data = await servicoDashboard.obterDadosDashboard();
        setDados(data);
      } catch (error) {
        console.error('Erro ao buscar dados do perfil', error);
      } finally {
        setCarregando(false);
      }
    };
    fetchDados();
  }, []);

  useEffect(() => {
    if (usuario) {
      const timeout = setTimeout(() => {
        setNomeForm(usuario.nome);
        setFotoPerfilForm(usuario.fotoPerfil || '');
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [usuario]);

  const handleSalvarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeForm.trim()) {
      atualizarUsuario({ nome: nomeForm, fotoPerfil: fotoPerfilForm });
      setModalEdicaoAberto(false);
      mostrarSucesso('Perfil atualizado com sucesso!');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilForm(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const mostrarSucesso = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const nomeUsuario = usuario?.nome || 'Convidado';
  const emailUsuario = usuario?.email || 'N/A';
  const dataEntrada = 'Agosto 2026';

  if (carregando || !dados) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 relative">
      
      {/* Toast de Sucesso */}
      {mensagemSucesso && (
        <div className="fixed top-20 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
          <Check className="w-5 h-5" />
          <span className="font-bold">{mensagemSucesso}</span>
        </div>
      )}

      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-md relative z-10 overflow-hidden">
          {usuario?.fotoPerfil ? (
            <img src={usuario.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl font-bold text-primary">{nomeUsuario.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="text-center md:text-left flex-1 relative z-10">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">{nomeUsuario}</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 text-stone-500">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {emailUsuario}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Membro desde {dataEntrada}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
            <Flame className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-stone-800">
            <AnimatedCounter value={dados.diasOfensiva} />
          </h3>
          <p className="text-stone-500 font-medium">Dias de Ofensiva</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-stone-800">
            <AnimatedCounter value={dados.xp} />
          </h3>
          <p className="text-stone-500 font-medium">XP Total</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-stone-800">
            <AnimatedCounter value={dados.licoesConcluidas} />
          </h3>
          <p className="text-stone-500 font-medium">Lições Concluídas</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-xl font-bold text-stone-800">Configurações da Conta</h2>
          </div>
          <div className="p-2">
            <button 
              onClick={() => setModalEdicaoAberto(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Editar Perfil</p>
                  <p className="text-sm text-stone-500">Altere seu nome de exibição</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-end">
          <button 
            onClick={logout}
            className="w-full bg-white border border-red-200 text-red-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </div>

      {/* Modal Editar Perfil */}
      {modalEdicaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">Editar Perfil</h3>
              <button onClick={() => setModalEdicaoAberto(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSalvarPerfil} className="p-6 space-y-4">
              <div className="flex flex-col items-center gap-4 mb-2">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 overflow-hidden relative group">
                  {fotoPerfilForm ? (
                    <img src={fotoPerfilForm} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{nomeForm.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-white text-xs font-bold mt-1">Alterar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Nome de Exibição</label>
                <input 
                  type="text" 
                  value={nomeForm}
                  onChange={(e) => setNomeForm(e.target.value)}
                  className="w-full border-2 border-stone-200 bg-white text-stone-800 rounded-xl p-3 focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">E-mail (Apenas leitura)</label>
                <input 
                  type="email" 
                  value={emailUsuario}
                  className="w-full border-2 border-stone-100 bg-stone-50 text-stone-500 rounded-xl p-3 cursor-not-allowed outline-none"
                  readOnly
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors mt-4">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
