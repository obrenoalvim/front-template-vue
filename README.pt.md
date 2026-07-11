[English](README.md) | Português

# front-template-vue

Template de frontend Vue 3 + Vite consumindo a API Laravel (`back-template-laravel`). Auth, i18n (en/pt), modo dark/light, formulários com validação traduzida, TanStack Query, SEO, Docker, e CI conectados pra uma feature de verdade ficar a um copy-paste de distância.

## Stack

- Vue 3 + Vite + TypeScript, Pinia, Vue Router
- Tailwind v4 + um kit de UI copy-in estilo `shadcn` (`src/components/ui`), ícones via `@lucide/vue`
- `vue-i18n` (en/pt), roteamento locale-aware (`/en/*`, `/pt/*`)
- `vee-validate` + `zod`, mensagens de validação roteadas pelo i18n globalmente
- `@tanstack/vue-query` pra cache de server-state
- `vue-sonner` pra toasts, `@vueuse/core` pro toggle de dark/light
- `@unhead/vue` pra tags SEO/OG/canonical por página
- Vitest (unit) + Playwright (e2e)
- oxlint + ESLint + Prettier; Husky + commitlint + lint-staged garantem conventional commits e auto-fix no pre-commit

## Configurando o projeto

```sh
npm install
cp .env.example .env   # já vem com defaults locais funcionando
npm run dev
```

### Scripts

```sh
npm run dev            # sobe o servidor de dev do Vite
npm run build           # type-check, build, gera sitemap.xml/robots.txt
npm run start            # preview do build de produção
npm run test              # testes unit (vitest run)
npm run test:watch         # testes unit, watch mode
npm run test:e2e            # Playwright (precisa de `npx playwright install` uma vez)
npm run lint / format / format:check
npm run docker:up / docker:down
```

## Variáveis de ambiente

Validadas no startup (`src/lib/env.ts`). A app lança erro imediatamente com mensagem legível se uma variável estiver ausente ou malformada, em vez de falhar mais tarde adiante.

| Var             | Propósito                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------- |
| `VITE_API_URL`  | URL base da API Laravel que esse frontend chama.                                              |
| `VITE_SITE_URL` | URL pública de onde esse frontend é servido, usada pra links canonical, tags OG, e o sitemap. |

Ver `.env.example`.

## Roles

Todo usuário tem um `role` (`'user'` | `'admin'`) vindo das respostas de login/`/api/account` da API Laravel. Nunca confia num `role` que você mesmo manda numa requisição. `/admin` (`src/views/AdminView.vue`) é a referência pra uma página admin-only: o `meta: { requiresAdmin: true }` da rota é checado no guard único de navegação em `src/router/index.ts`, que também aguarda um `fetchMe()` se o usuário ainda não foi buscado (um reload duro chega com token mas sem usuário carregado). Isso é só conveniência de UX. O gate real é o middleware `admin` do Laravel rejeitando a requisição. Promove um usuário pelo lado Laravel (`UPDATE users SET role = 'admin' ...`), depois loga de novo. O role é lido fresco de `/api/account`, não fica em cache de uma sessão antiga.

## Sessões

Login/register retornam `{ user, accessToken, refreshToken }`. A API Laravel emite os dois como tokens Sanctum ability-scoped separados (ver o README daquele repo). `src/lib/api-client.ts` pega um `401`, chama o handler de refresh registrado pela auth store (`POST /api/auth/refresh`, autenticado pelo próprio refresh token: mandado como Bearer header da requisição, não como campo do body), e tenta de novo a requisição que falhou uma vez com o novo access token. Requisições concorrentes que tomam 401 mais ou menos na mesma hora compartilham um único refresh em andamento (uma promise a nível de módulo, não um refresh por requisição), pra não competir com a rotação do Laravel e invalidar o refresh token umas das outras. Se o próprio refresh falhar, a store faz logout e o erro original passa normal. `logout()` manda `refresh_token` no body pra revogar no servidor também, não só a sessão local.

## Docker

```sh
npm run docker:up
```

Build multi-stage: Node builda o bundle estático, `nginx-unprivileged` (non-root por padrão) serve isso na porta 8080 com um endpoint `/health` e roteamento fallback pra SPA. `VITE_API_URL`/`VITE_SITE_URL` são assados em **build time** (Vite os insere no bundle JS) via build args do Docker. Confere os comentários no `docker-compose.yml` antes de mudar eles.

## Notas de design e armadilhas

- **O error map do Zod é global e i18n-aware.** `src/lib/zod-i18n.ts` sobrescreve `z.setErrorMap` uma vez, no boot da app, então as mensagens nativas de todo schema (required/email/min length) são traduzidas automaticamente. Você não escreve string de erro por campo. Mensagens de `.refine()` são a exceção: são avaliadas uma vez quando o objeto de schema é construído (dentro do `setup()` de um componente), então uma chamada `t()` assada dentro de uma mensagem de `.refine()` não retraduz se o usuário trocar de locale sem remontar o formulário. Ok pro escopo desse template. Se isso te morder, move o check de descompasso pra fora do schema e pro `handleSubmit`.
- **`src/lib/env.ts` roda antes do i18n existir**, e o `main.ts` importa ele primeiro de propósito. Não pode depender do error map traduzido do zod (ovo-e-galinha), então passa strings `message` explícitas pro `z.string().url({ message: ... })` em vez de se apoiar no map global.
- **Links locale-aware usam `LocaleLink`, não `RouterLink` direto.** Um `RouterLink to="/foo"` cru derrubaria o prefixo `/en`/`/pt`. A única exceção fica dentro do próprio `LocaleLink.vue`.
- **O guard de auth e a sincronização de locale vivem num `router.beforeEach` só** (`src/router/index.ts`), não dois guards separados. O checklist pede um guard centralizado único, e separar sync-de-locale de check-de-auth convida os dois a saírem de sincronia na ordem de redirect.
- **Isso é uma SPA pura (sem SSR).** Meta tags setadas via `@unhead/vue` atualizam o DOM depois do bundle JS rodar. Isso é ok pra navegadores e a maioria dos crawlers modernos, mas scrapers OG clássicos (alguns previews de social-share) que não executam JS não vão ver elas. Adiciona prerendering ou SSR se isso importar pro teu deploy; é fora do escopo aqui.
- **O teste de register→logout do `e2e/auth.spec.ts` precisa de uma API Laravel real** em `VITE_API_URL`. Ele se auto-pula no CI a menos que `E2E_API_URL` esteja setado (ver `.github/workflows/ci.yml`), porque esse repo não roda a API Laravel como serviço de CI. O teste de auth-guard no mesmo arquivo não precisa de backend e sempre roda.
- **Build args do Docker vs. `.env`**: `docker-compose.yml` usa `DOCKER_VITE_API_URL`/`DOCKER_VITE_SITE_URL`, não `VITE_API_URL`/`VITE_SITE_URL` direto. O Compose auto-carrega o `.env` desse projeto pra substituição de variável, e esse arquivo já define os nomes simples pro `npm run dev` local. Reusar eles no `docker-compose.yml` assaria silenciosamente as URLs do teu servidor de dev na imagem de produção.

## Setup de IDE recomendado

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (e desabilita o Vetur).

## Suporte a tipos pra imports `.vue` em TS

TypeScript não consegue lidar com informação de tipo pra imports `.vue` por padrão, então substituímos a CLI `tsc` por `vue-tsc` pra type checking. Nos editores, precisamos do [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) pra deixar o language service do TypeScript ciente dos tipos `.vue`.
