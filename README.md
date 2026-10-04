# Finno — CashFlow Finanças

Aplicativo mobile para organização de finanças pessoais. O usuário pode registrar receitas e despesas, acompanhar o saldo e consultar a evolução do seu orçamento por meio de relatórios e gráficos.

> **Projeto com fins estudantis**
>
> Este repositório foi desenvolvido para aprendizado e prática de desenvolvimento mobile, arquitetura de software, persistência local e construção de interfaces. Ele não representa um produto financeiro comercial nem oferece aconselhamento financeiro. Os recursos e a segurança ainda podem ser aprimorados antes de qualquer uso em produção.

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=000000)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

## Visão geral

O CashFlow Finanças, apresentado no aplicativo como **Finno**, é uma aplicação mobile que funciona localmente no dispositivo. Seu objetivo é tornar mais simples o registro e a visualização de movimentações financeiras do dia a dia.

### O que já está disponível

- Cadastro e edição do perfil do usuário, incluindo avatar.
- Registro, edição, consulta e exclusão de receitas e despesas.
- Categorias personalizáveis para organizar as transações.
- Tela inicial com saldo, receitas, despesas e lançamentos recentes.
- Relatório mensal com filtros e histórico de transações.
- Gráficos por semana, mês e ano, incluindo distribuição de despesas.
- Transações recorrentes.
- Status de transação: pendente, paga ou cancelada.
- Notificações locais configuráveis.
- Tema claro, tema escuro e tema baseado no sistema.
- Idiomas português e inglês.
- Escolha de moeda.
- Exportação e importação de dados em JSON e CSV, além de exportação em PDF.
- Proteção de algumas áreas por autenticação local do dispositivo, quando disponível.

## Para quem não é da área de tecnologia

O aplicativo pode ser usado como uma agenda financeira pessoal: primeiro, crie seu perfil; depois, registre cada entrada ou saída de dinheiro com título, valor, data, categoria e status. A tela inicial resume sua situação, enquanto as áreas de relatório e gráficos ajudam a identificar padrões de gastos.

Os dados são armazenados localmente no dispositivo. Por isso, não há uma conta online ou sincronização automática entre aparelhos. A funcionalidade de backup permite exportar os dados para que o usuário possa guardá-los e importá-los posteriormente.

## Para profissionais e estudantes de tecnologia

O projeto utiliza uma arquitetura modular baseada em `features`. A interface é construída com Expo Router e React Native; os dados são persistidos em SQLite por meio do Drizzle ORM; e as entradas são validadas com Zod. Hooks, serviços e repositórios separam a apresentação das regras de negócio e do acesso ao banco.

### Tecnologias principais

- **Expo SDK 54 e React Native** — desenvolvimento multiplataforma para Android, iOS e web.
- **TypeScript** — tipagem estática e maior segurança durante o desenvolvimento.
- **Expo Router** — navegação baseada na estrutura de arquivos da pasta `app/`.
- **SQLite com `expo-sqlite`** — banco de dados local no dispositivo.
- **Drizzle ORM** — schemas e consultas ao SQLite.
- **Zod** — validação dos dados de entrada.
- **React Navigation** — suporte à navegação mobile.
- **Victory Native e React Native Skia** — gráficos e visualizações.
- **i18next / react-i18next** — internacionalização.
- **Expo Notifications, Secure Store, Document Picker, Print e Sharing** — recursos nativos de notificações, armazenamento seguro, arquivos e compartilhamento.

## Requisitos

- Node.js instalado, preferencialmente uma versão compatível com o Expo SDK 54.
- npm.
- Para Android: Android Studio, SDK configurado e um emulador ou dispositivo físico.
- Para iOS: macOS com Xcode e um simulador ou dispositivo físico.
- Para uma execução rápida, também é possível usar o Expo Go quando os recursos utilizados forem compatíveis com ele. Como o projeto usa módulos nativos, um development build pode ser necessário.

## Como executar

Entre na pasta do aplicativo e instale as dependências:

```bash
cd CashFlow_Financas
npm install
```

Inicie o servidor do Expo:

```bash
npm start
```

No terminal exibido pelo Expo, escolha a plataforma desejada ou escaneie o QR Code com um dispositivo compatível.

### Executar em uma plataforma específica

```bash
npm run android
npm run ios
npm run web
```

Os comandos `android` e `ios` usam `expo run` e podem exigir a configuração prévia do ambiente nativo. O comando `web` abre a versão web, mas alguns recursos dependentes do dispositivo podem não funcionar da mesma forma no navegador.

## Scripts disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento do Expo. |
| `npm run android` | Compila e executa a aplicação no Android. |
| `npm run ios` | Compila e executa a aplicação no iOS. |
| `npm run web` | Executa a aplicação na versão web. |
| `npm run lint` | Verifica problemas de estilo e qualidade do código. |
| `npm run reset-project` | Executa o script de redefinição disponibilizado pelo template do projeto. Use com atenção. |

## Organização do repositório

```text
CashFlow-Mobile-main/
├── README.md
└── CashFlow_Financas/
    ├── app/                    # Rotas e telas do Expo Router
    ├── src/
    │   ├── components/         # Componentes reutilizáveis de interface
    │   ├── db/                 # Inicialização, schemas e migrações do SQLite
    │   ├── features/           # Módulos de usuário, transação, categoria e notificações
    │   ├── hooks/              # Estado e operações reutilizadas pelas telas
    │   ├── services/           # Regras de aplicação e serviços de domínio
    │   ├── theme/              # Tema, cores e responsividade
    │   └── i18n/               # Traduções em português e inglês
    ├── assets e locales/       # Imagens, ícones e configurações de localização
    ├── app.json               # Configuração do Expo
    ├── package.json           # Dependências e scripts
    └── tsconfig.json          # Configuração do TypeScript
```

### Entidades persistidas

- **Usuário**: dados básicos do perfil.
- **Categoria**: classificação de receitas e despesas.
- **Transação**: título, descrição, valor, tipo, data, status e vínculos com usuário/categoria.
- **Recorrência**: configuração de lançamentos que se repetem.
- **Notificação**: notificações e seus agendamentos locais.

## Dados, privacidade e limitações

- O banco principal é local; o projeto não possui backend ou sincronização em nuvem.
- Os arquivos exportados podem conter informações financeiras pessoais. Armazene-os em local seguro e não os compartilhe sem revisar o conteúdo.
- O backup é uma ferramenta de exportação/importação de dados, não um serviço automático de cópia de segurança.
- Como se trata de um projeto estudantil, não há garantia de disponibilidade, suporte, auditoria de segurança ou adequação para uso financeiro crítico.

## Status do projeto

Projeto estudantil em desenvolvimento contínuo. O fluxo principal de finanças pessoais está implementado, mas o código, a experiência de uso, a cobertura de testes e a preparação para produção ainda podem evoluir.

## Contribuição

Sugestões e contribuições são bem-vindas para fins de aprendizado. Ao propor uma alteração, descreva o problema, explique a solução e, quando possível, informe como ela foi testada.

## Licença

Não há uma licença de código aberto definida neste repositório no momento. Consulte o responsável pelo projeto antes de reutilizar ou redistribuir o código.
