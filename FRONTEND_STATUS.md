# Status do Front-end: Tupi Digital

Este arquivo serve como um ponto de verdade (Single Source of Truth) para o andamento do desenvolvimento do front-end, alinhado às diretrizes oficiais do projeto.

---

## 📌 1. VISÃO GERAL DO PROJETO E ESTADO ATUAL
O Tupi Digital é uma plataforma educacional para o aprendizado da língua Tupi, focada na valorização cultural e na preservação da língua e cultura indígena. Com uma identidade visual própria e gamificada (semelhante ao Duolingo).

**Estado da Integração (Back-end):**
O backend (Java 21, Spring Boot, PostgreSQL) cuidará de toda a validação de regras de negócios (cálculo de XP, validação de respostas, níveis, conquistas). O Frontend **agora está integrado com a API real** (via Axios), realizando a comunicação sem o uso de mocks.

---

## 🛠 2. STACK TECNOLÓGICA DO FRONTEND
- **Framework:** Next.js 16 (App Router) - Mobile first
- **Linguagem:** TypeScript (Uso rigoroso, sem `any`)
- **Estilização:** Tailwind CSS v4 (Identidade: natureza, cultura - 🌿 🌎 🪶 🌱)
- **Requisições:** Axios (Com interceptors e injeção do JWT: `Authorization: Bearer <token>`)

---

## 🗺 3. ARQUITETURA DE DIRETÓRIOS
```text
src/
 ├── app/           (Rotas e páginas do Next.js)
 ├── components/    (Componentes reutilizáveis e isolados: UI pura)
 ├── services/      (Instância do Axios e chamadas reais/mockadas para API)
 ├── hooks/         (Custom hooks e regras visuais)
 ├── types/         (Interfaces TypeScript alinhadas aos DTOs do Backend)
 ├── contexts/      (Gerenciamento de estados globais, ex: AuthContext)
 ├── utils/         (Funções auxiliares)
 └── styles/        (Configurações globais)
```

---

## 🚀 4. CRONOGRAMA DE IMPLEMENTAÇÃO (MVP) & PROGRESSO

A prioridade atual do MVP segue os passos abaixo. Nós estamos atualizando os checkboxes conforme avançamos:

- [x] **1. Landing Page (`/`), Login (`/login`) e Cadastro (`/cadastro`):**
  - O design deve focar no propósito educacional.
- [x] **2. Setup do Contexto de Autenticação (Fluxo JWT):**
  - Criação do `AuthContext` e uso do `authService` (mocks temporários) gerenciando a sessão e bloqueando rotas.
- [x] **3. Layout Principal (Navbar, Sidebar/Bottom bar, e Dashboard):**
  - Implementar `/dashboard` como ponto de partida pós-login mostrando XP, Nível, Sequência (Streak).
- [x] **4. Navegação de Trilhas e Módulos:**
  - Fluxo nas rotas `/trilhas` e `/trilhas/[id]`.
- [x] **5. Motor de Renderização de Lições e Exercícios (com Mocks):**
  - Rota `/licoes/[id]`. Fluxo contínuo: *Aprendizado -> Exercício -> Feedback -> Próximo*.
  - Componentização dos exercícios: `MultipleChoiceExercise`, `TranslationExercise`, etc.
- [x] **6. Integração Real:**
  - Substituição dos Mocks pela API real assim que as rotas estiverem liberadas.

---

## 🎨 5. DIRETRIZES DE DESIGN E GAMIFICAÇÃO
- [x] **Estética e UI:** Cores inspiradas na natureza, separação clara entre "aprendizado" e "contexto cultural".
- [x] **Mobile-First:** Botões grandes para toque.
- [x] **Acessibilidade:** Alto contraste, navegação por teclado (`focus-visible`), rótulos ARIA (`aria-label`, `aria-live`, `aria-valuenow`), feedbacks de estado claros.
- [x] **Gamificação:** Barras de progresso animadas, contadores dinâmicos, destaque de ganho de XP e Streak (sem excessos).

*(Última atualização: Criação e refatoração das páginas de Dashboard, Conquistas, Perfil; correções de UI, acessibilidade, erros de build (template literals) e resolução do cache do git (.next))*
