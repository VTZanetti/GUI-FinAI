# GUI-FinAI

Interface web oficial do backend **FinAI** (ASP.NET Core / .NET 10) — SPA em **Vue 3 + Vite + TypeScript**.

> Compatível com o backend **v1.0** (roadmap completo), retrocompatível com **v0.8** — a v1.0 não alterou contratos REST.

## Stack

Vue 3 (Composition API) · Vite 6 · TypeScript · Vue Router 4 · Pinia · Axios · Tailwind CSS 3 · Chart.js · VeeValidate + Yup · Vitest + Vue Test Utils + MSW · Playwright (E2E) · Docker (nginx)

## Início rápido

```powershell
npm install
npm run dev          # http://localhost:5173 (proxy /api → http://localhost:8080)
```

### Stack integrada (GUI + API + PostgreSQL + Redis + Ollama)

```powershell
docker compose up -d --build
# GUI: http://localhost:5173 | API: http://localhost:8080/swagger
```

Requisito: o repositório do backend FinAI como pasta irmã (`../FinAI`) para o build da API.

### Modo demonstração (sem backend)

```powershell
$env:VITE_DEMO_MODE="true"; npm run dev
```

A GUI funciona com mocks locais (`src/api/mocks/`) — banner "Modo demonstração" visível.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server (Vite, :5173) |
| `npm run build` | Build de produção → `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm test` | Testes unitários/componentes (Vitest) |
| `npm run test:coverage` | Testes com cobertura (thresholds ≥ 80% core) |
| `npm run test:e2e` | Smoke E2E (Playwright) |
| `npm run type-check` | Checagem de tipos (vue-tsc) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Estrutura

```
src/
├── api/            # Axios client + interceptors + services (única camada HTTP)
├── stores/         # Pinia (auth — tokens em memória)
├── router/         # Vue Router + guards (auth/admin)
├── views/          # Páginas
├── components/     # layout/, ui/, features
├── composables/    # useApi, useToast, useFormat
├── types/          # DTOs espelhando os contratos
└── utils/          # currency, date, problemDetails, jwt
```

## Segurança

- Tokens JWT **apenas em memória** (nunca `localStorage`/`sessionStorage`).
- Refresh automático serializado (fila) + logout em falha.
- Erros da API convertidos em mensagens amigáveis (pt-BR) via ProblemDetails.
- Sem `v-html` com dados dinâmicos; CSP básica no `index.html`.

## Deploy (Portainer)

GUI e API em **stacks separadas** no mesmo Portainer (ciclos de vida independentes):

- Stack **gui-finai**: `docker-compose.prod.yml` (variável `VITE_API_BASE_URL` = URL pública da API).
- Stack **finai**: compose do repositório do backend.

> Pendência documentada: o backend precisa de CORS (`UseCors`) para servir origens diferentes no Portainer.
