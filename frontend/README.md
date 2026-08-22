# Lead Compass

Estou construindo um SaaS B2B de leads em React  + TypeScript + Tailwind. Já existe uma tela funcional de "Buscar Empresas" em app/page.tsx, conectada a uma API real via NEXT_PUBLIC_API_URL — não a recrie nem altere sua lógica de busca/filtros/exportação CSV; ela deve virar apenas uma das opções do menu lateral.

Tema visual a manter (já definido em tailwind.config.js, reaproveite os tokens): fundo bg (#0A0E16), cards surface (#10151F), bordas edge (#1E2734), texto ink (#E7EAF0) e inkMuted (#8A93A6), acento accent (#38BDF8). Fonte mono para labels/dados técnicos, como já está na tela existente.

Adicione uma navegação lateral (sidebar, colapsável em mobile) com 5 áreas:

Buscar Empresas (já existe — só encaixar no novo layout)

Buscar Sócios — busca por nome/CPF parcial, com resultados vinculados às empresas

Minhas Empresas — lista de empresas salvas/favoritadas pelo usuário

Minhas Exportações — histórico de exportações CSV (data, filtros usados, nº de linhas, link de download)

E-mail — composição simples (para, assunto, corpo) e histórico de envios

Agenda/Anotações — lista de tarefas/notas vinculadas a uma empresa ou sócio

Para as áreas 2–6, use dados simulados isolados em lib/mock-data.ts, e centralize as chamadas de API em lib/api.ts com funções já assinadas (ex: buscarSocios(), listarExportacoes()) que hoje retornam mock mas estão prontas para trocar por fetch(${process.env.NEXT_PUBLIC_API_URL}/...) depois — comente com // TODO: integrar com API real em cada uma.

Não implemente autenticação real, acesso a banco, nem envio real de e-mail. Responsivo (mobile-first). TypeScript estrito, sem any. Não mexa em tailwind.config.js, globals.css nem na lógica de app/page.tsx além de encaixá-la no novo layout de sidebar.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f064569e-38ab-46e8-9338-93917f93591e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
