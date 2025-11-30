# Lemon - Documentação Técnica

Este documento contém detalhes técnicos sobre a implementação, arquitetura e configuração do projeto Lemon. Para informações sobre funcionalidades e regras de negócio, consulte o [README.md](./README.md) principal.

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + Shadcn UI
- **Gerenciamento de Estado**: React Hooks + Context API (para Auth e Team)
- **Formulários**: React Hook Form + Zod

### Backend & Infraestrutura

- **BaaS (Backend-as-a-Service)**: Supabase
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage (para recibos)
- **Server Actions**: Utilizadas para mutações de dados (Clean Architecture adaptada)

### Integrações Externas

- **Stripe**: Processamento de pagamentos e gestão de assinaturas.
- **Google Generative AI (Gemini)**: Processamento e leitura de recibos (OCR + AI).

### Testes

- **Unitários**: Vitest
- **E2E**: Playwright

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma adaptação da **Clean Architecture** para o ecossistema Next.js:

```
src/
├── app/                 # Camada de Apresentação (Next.js App Router)
│   ├── (app)/           # Rotas autenticadas
│   ├── auth/            # Rotas de autenticação
│   └── api/             # Webhooks e APIs públicas
├── domain/              # Camada de Domínio (Core)
│   ├── entities/        # Entidades de negócio e regras puras
│   ├── interfaces/      # Contratos de repositórios e serviços
│   └── dto/             # Data Transfer Objects
├── infrastructure/      # Camada de Infraestrutura
│   ├── repositories/    # Implementação dos repositórios (Supabase)
│   └── services/        # Serviços externos (Stripe, AI)
└── components/          # Componentes React reutilizáveis
```

### Padrões Adotados

- **Repository Pattern**: O frontend não chama o Supabase diretamente para lógica de negócio complexa. Usa-se Use Cases que dependem de interfaces de repositório.
- **Use Cases**: Cada ação do usuário (ex: `CreateExpense`) é um caso de uso isolado, facilitando testes unitários.
- **Dependency Injection**: Injeção manual de dependências nos Server Actions.

---

## 🚦 Configuração Local

### Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Stripe

### Passo a Passo

1.  **Clone o repositório**

    ```bash
    git clone https://github.com/seu-usuario/lemon.git
    cd lemon
    ```

2.  **Instale as dependências**

    ```bash
    npm install
    ```

3.  **Variáveis de Ambiente**
    Crie um arquivo `.env.local` na raiz com as seguintes chaves:

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

    # Stripe
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
    NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...

    # Google AI
    GOOGLE_GENERATIVE_AI_API_KEY=your_api_key

    # App
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  **Rodar Migrations (Supabase)**
    Se estiver usando o CLI do Supabase localmente:

    ```bash
    npx supabase start
    ```

5.  **Rodar o Projeto**
    ```bash
    npm run dev
    ```

---

## 🧪 Testes

### Unitários

Rodam com Vitest e testam principalmente os Use Cases e Entidades.

```bash
npm run test
```

### End-to-End (E2E)

Rodam com Playwright e testam fluxos críticos de usuário.

```bash
npm run test:e2e
```

---

## 📦 Deploy

O projeto é otimizado para deploy na **Vercel**.
Certifique-se de configurar todas as variáveis de ambiente no painel da Vercel.
