# RYVON

Painel operacional de evolução física. Substitui o acompanhamento semanal no Notion: registro diário, treino, macros, cardio, sono, peso, fotos, resumo automático e comparação de semanas.

Não é um app de diagnóstico médico.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + componentes próprios no estilo shadcn
- Supabase (PostgreSQL, Auth, Storage)
- React Hook Form / Zod
- Recharts + date-fns

Pronto para deploy na Vercel.

## 1. Criar o projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie:
   - Project URL
   - `anon` `public` key
   - `service_role` key (só local, nunca no browser)
3. Authentication → Providers: deixe e-mail habilitado.

## 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Modos de execução:

| Modo | Variáveis |
|------|-----------|
| **Demo local** | `NEXT_PUBLIC_AUTH_DISABLED=true` (sem Supabase obrigatório) |
| **Auth real** | omitir `NEXT_PUBLIC_AUTH_DISABLED` + Supabase configurado |

Em **produção**, nunca use `NEXT_PUBLIC_AUTH_DISABLED=true`. Sem Supabase configurado, o app exibe erro explícito de configuração.

```
NEXT_PUBLIC_AUTH_DISABLED=true
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SEED_EMAIL=lucas@fitness-os.local
SEED_PASSWORD=fitnessos
SEED_NAME=Lucas
```

## 3. Migration

No Supabase SQL Editor, cole e execute:

`supabase/migrations/001_init.sql`

Isso cria tabelas, FKs, indexes, RLS, trigger de perfil e o bucket `progress-photos`.

## 4. Seed

Com `.env.local` preenchido:

```bash
npm install
npm run seed
```

O script cria o usuário, metas Day On/Off, calendário Pull/Push/Lower, cargas iniciais, Semana 1 (30/08–05/09), pesos 69,6 → 69,0 e a ocorrência de incômodo no antebraço.

Login padrão do seed:

- e-mail: `lucas@fitness-os.local`
- senha: `fitnessos`

Altere a senha depois do primeiro acesso.

## 5. Rodar local

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Após o login, o app vai para `/dashboard`.

## 6. Fluxo mínimo

1. Login
2. Dashboard
3. Hoje → sono, macros, cardio
4. Iniciar treino → cargas/reps → finalizar
5. Registrar peso
6. Semana e relatório
7. Progresso e histórico do exercício

O botão **+ Registrar** (ou `Ctrl/Cmd + K`) abre entrada rápida.

## 7. Deploy Vercel

1. Importe o repositório na Vercel.
2. Configure as mesmas env vars (sem `SUPABASE_SERVICE_ROLE_KEY` no client; ela só é necessária para o seed local).
3. Em Authentication → URL Configuration do Supabase, adicione a URL da Vercel.
4. Deploy.

O seed deve ser rodado uma vez na sua máquina, não na Vercel.

## PWA

O app tem manifest, theme color e ícones. No iPhone: Safari → Compartilhar → **Adicionar à Tela de Início**.

## Estrutura

```
src/app        rotas
src/domain     regras (aderência, progressão, scores)
src/services   persistência Supabase
src/lib        auth, supabase, validações
src/types      contratos
src/utils      datas e formatação
supabase/      migration SQL
scripts/seed.ts
```

## Limitações atuais

- Exportação PDF ainda não existe; use Imprimir no relatório (CSS de print).
- Food logging por alimento ainda não é obrigatório; a arquitetura de plano alimentar já existe.
- Compressão de imagem no upload é básica (arquivo original no Storage).
- Comparação mensal de fotos (junho/julho/...) fica para a próxima iteração; o comparador por data já funciona.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run build
```
