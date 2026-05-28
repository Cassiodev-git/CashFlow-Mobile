# CashFlow Finanças

Aplicativo mobile em desenvolvimento para organização de finanças pessoais, com estrutura inicial para cadastro de usuário, categorias e transações financeiras.

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=000000)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

## Sobre o projeto

O CashFlow Finanças é um projeto criado com Expo e React Native. A base atual já conta com banco local SQLite, schemas com Drizzle ORM e validações com Zod para os principais dados do aplicativo.

No momento, a interface está em fase inicial e exibe apenas uma tela simples de início. A maior parte da estrutura implementada está concentrada na camada de dados e nas regras básicas de cadastro.

## Funcionalidades estruturadas

- Inicialização de banco local com `expo-sqlite`.
- Modelagem das tabelas de usuários, categorias e transações.
- Repositórios para criar, atualizar e remover registros.
- Validação de dados com Zod.
- Organização por módulos em `features`.
- Navegação base com Expo Router.

## Tecnologias

- **Expo**: ambiente de desenvolvimento para aplicações React Native.
- **React Native**: construção da interface mobile.
- **TypeScript**: tipagem estática no código.
- **Expo Router**: roteamento baseado na pasta `app`.
- **SQLite**: persistência local dos dados.
- **Drizzle ORM**: definição dos schemas e acesso ao banco.
- **Zod**: validação dos dados de entrada.
- **UUID**: geração de identificadores únicos.

## Estrutura do projeto

```txt
CashFlow_Financas/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── db/
│   │   ├── database.ts
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── migrations/
│   └── features/
│       ├── category/
│       ├── transaction/
│       └── user/
├── app.json
├── package.json
└── tsconfig.json
```

## Entidades principais

### Usuário

Armazena informações básicas como nome, e-mail e imagem de perfil.

### Categoria

Representa categorias de receitas ou despesas, com nome, ícone e tipo.

### Transação

Representa lançamentos financeiros com título, descrição, valor, tipo, status, data e vínculo com usuário.

## Como executar

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm start
```

Executar em plataformas específicas:

```bash
npm run android
npm run ios
npm run web
```

## Scripts disponíveis

```bash
npm start        # inicia o Expo
npm run android  # abre no Android
npm run ios      # abre no iOS
npm run web      # abre no navegador
npm run lint     # executa o lint
```

## Status

Projeto em desenvolvimento. A base de persistência local e validação já está organizada, enquanto as telas e fluxos de uso ainda precisam ser implementados.
