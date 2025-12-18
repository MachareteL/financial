# AI Prompts Directory

Este diretório contém todos os prompts usados pela aplicação para interações com modelos de IA.

## Estrutura

Cada arquivo de prompt exporta um objeto `PromptTemplate` com:

- **id**: Identificador único do prompt
- **name**: Nome descritivo
- **version**: Versão semântica (major.minor.patch)
- **description**: Descrição do propósito do prompt
- **template**: Template string com possíveis variáveis `{{variableName}}`
- **variables**: Array de nomes de variáveis esperadas
- **metadata**: Configurações do modelo e tags

## Versionamento

Siga versionamento semântico:

- **Major (X.0.0)**: Mudanças que alteram significativamente a estrutura ou output esperado
- **Minor (0.X.0)**: Adição de features ou melhorias que mantêm compatibilidade
- **Patch (0.0.X)**: Pequenas correções ou ajustes de wording

## Tags de Ambiente

Use tags para controlar qual versão do prompt é usada em cada ambiente:

- `production`: Prompts em produção
- `staging`: Prompts em teste/staging
- `development`: Prompts experimentais

## Como Adicionar um Novo Prompt

1. Crie um arquivo `{nome-do-prompt}.prompt.ts`
2. Defina o objeto `PromptTemplate` com todos os campos obrigatórios
3. Exporte-o no `index.ts`
4. Documente as variáveis esperadas

## Variáveis Dinâmicas

Variáveis são injetadas em runtime usando a sintaxe `{{variableName}}`. Exemplos:

```typescript
template: "Analise os seguintes dados: {{data}}";
variables: ["data"];
```

O sistema automaticamente substituirá `{{data}}` pelo valor fornecido no `PromptContext`.
