'use client';

import { User, Mail, Calendar, LogOut, Bell, Shield, Zap, Flame, BookOpen } from 'lucide-react';
import { usarAutenticacao } from '@/contexts/ContextoAutenticacao';

export default function PerfilPage() {
  const { usuario, logout } = usarAutenticacao();

  // Dados mockados caso o context não tenha
  const nomeUsuario = usuario?.nome || 'Potiguara';
  const emailUsuario = usuario?.email || 'potiguara@tupidigital.com.br';
  const dataEntrada = 'Agosto 2026';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Profile */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-md relative z-10">
          <span className="text-5xl font-bold text-primary">{nomeUsuario.charAt(0)}</span>
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
          <h3 className="text-3xl font-bold text-stone-800">7</h3>
          <p className="text-stone-500 font-medium">Dias de Ofensiva</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-stone-800">2.450</h3>
          <p className="text-stone-500 font-medium">XP Total</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-bold text-stone-800">12</h3>
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
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Editar Perfil</p>
                  <p className="text-sm text-stone-500">Altere seu nome e foto</p>
                </div>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Notificações</p>
                  <p className="text-sm text-stone-500">Gerencie alertas e e-mails</p>
                </div>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors text-left group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-800">Privacidade e Senha</p>
                  <p className="text-sm text-stone-500">Atualize sua senha de acesso</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 mb-1">Tupi Digital Plus</h3>
              <p className="text-stone-600 text-sm mb-4">Desbloqueie recursos avançados de aprendizado e remova anúncios.</p>
              <button className="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors text-sm">
                Conhecer Planos
              </button>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full bg-white border border-red-200 text-red-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}
