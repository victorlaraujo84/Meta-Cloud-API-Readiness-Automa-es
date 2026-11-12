# Meta Cloud API Readiness & Automações

Aplicação para avaliar a preparação de uma empresa para a API oficial do WhatsApp da Meta e organizar os próximos passos da implantação.

## Funcionalidades

- Questionário de requisitos, pontuação de prontidão e plano de ação.
- Histórico de diagnósticos e referências oficiais no catálogo de requisitos.
- Fluxo de solicitação de orçamento e chat consultivo com configuração Botpress.

## Executar localmente

Node.js e npm.

Para conectar um chat Botpress próprio, configure `WEBHOOK_CHAT` conforme [`.env.example`](.env.example). O servidor lê essa configuração do ambiente do processo.

Na raiz do projeto, execute:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` na configuração padrão. Preencha o perfil da empresa, responda ao questionário e revise o painel de pontuação e o plano de ação.

## Comandos

- `npm run lint` — Verifica os tipos do TypeScript.
- `npm run build` — Gera a versão de distribuição.
- `npm run preview` — Pré-visualiza o build do Vite.
- `npm run start` — Inicia o servidor da aplicação.

## Arquivos de referência

- [Catálogo de requisitos](src/data/metaRequirements.ts)
- [Cálculo da pontuação](src/utils/scoreEngine.ts)
- [API e configuração do chat](server.ts)
