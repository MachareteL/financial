# Lemon | Sistema Financeiro Inteligente

Bem-vindo à documentação oficial do **Lemon**, a plataforma definitiva para gestão financeira familiar e de pequenos times.

Este documento descreve as funcionalidades, regras de negócio e planos de acesso do sistema. Para detalhes técnicos de implementação, consulte a [Documentação Técnica](./TECHNICAL_DOCS.md).

---

## 🌟 Visão Geral

O Lemon centraliza a gestão financeira, permitindo que casais, famílias ou pequenos times controlem seus gastos de forma colaborativa, transparente e automatizada.

---

## 💎 Planos e Acesso

### 🆓 Plano Gratuito (Free)

Ideal para começar a organizar as finanças.

- **Limite de Times**: Usuários podem criar apenas **1 time gratuito**.
- **Funcionalidades Básicas**:
  - Criação manual de despesas e receitas.
  - Gestão de categorias e orçamentos.
  - Convite de membros (limitado).
- **Restrições**:
  - Sem acesso à Leitura de Recibos com IA.
  - Sem acesso a Insights Avançados.

### 🚀 Plano PRO

Para quem busca automação e inteligência máxima.

- **Times Ilimitados**: Crie quantos times precisar.
- **Funcionalidades Exclusivas**:
  - ✨ **Leitura de Recibos com IA**: Basta fazer upload da foto e o sistema preenche tudo.
  - 📊 **Insights Financeiros**: Relatórios detalhados sobre hábitos de consumo.
  - 🤝 **Membros Ilimitados**: Convide toda a família sem restrições.
  - 📞 **Suporte Prioritário**.

> **Nota sobre Trial**: Todo novo time criado recebe automaticamente **14 dias de teste grátis** do plano PRO.

---

## 🛠️ Funcionalidades e Regras de Negócio

### 1. Gestão de Times (Teams)

O "Time" é a unidade central do Lemon. Todas as finanças pertencem a um time.

- **Criação**: Ao criar um time, você se torna o **Proprietário (Owner)**.
- **Convites**: O proprietário pode convidar outros membros por e-mail.
- **Permissões**:
  - **Owner**: Acesso total (Gerenciar Assinatura, Deletar Time, Gerenciar Membros).
  - **Admin**: Pode gerenciar despesas, categorias e orçamentos.
  - **Member**: Pode apenas visualizar e criar suas próprias despesas (configurável).

### 2. Despesas (Expenses)

O núcleo do sistema.

- **Criação Manual**: Data, Valor, Descrição, Categoria.
- **Parcelamentos**: O sistema suporta compras parceladas. Ao criar uma despesa parcelada (ex: 10x de R$100), o sistema gera automaticamente 10 registros futuros, facilitando a previsão de fluxo de caixa.
- **Recorrência**: Despesas fixas (Aluguel, Netflix) podem ser configuradas como recorrentes.
- **Anexos**: Upload de comprovantes/recibos (armazenados de forma segura).

### 3. Receitas (Incomes)

Rastreamento de entradas financeiras.

- Salários, dividendos, vendas, etc.
- Permite visualizar o saldo líquido (Receitas - Despesas) do mês.

### 4. Orçamentos (Budgets)

Controle de teto de gastos.

- Defina um limite mensal para cada categoria (ex: R$ 1.000,00 para Supermercado).
- Acompanhe visualmente o quanto já foi consumido daquele orçamento.

### 5. Categorização

- **Categorias Padrão**: O sistema já vem com categorias essenciais (Moradia, Transporte, Alimentação).
- **Personalização**: Crie categorias personalizadas para se adequar à sua realidade.

---

## � Segurança e Privacidade

- **Dados Isolados**: Os dados de um time são estritamente isolados. Membros de um time não veem dados de outros times.
- **Criptografia**: Todas as conexões são seguras (SSL/TLS).
- **Autenticação**: Login seguro via E-mail/Senha (gerenciado pelo Supabase Auth).

---

## 📞 Suporte

Precisa de ajuda?
Entre em contato através do menu "Ajuda" dentro do aplicativo ou envie um e-mail para suporte@lemon.finance.
