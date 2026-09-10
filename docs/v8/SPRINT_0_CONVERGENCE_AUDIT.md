# Sprint 0 — Convergence Audit (DEFINITIVO)

**Data:** 2026-09-10  
**Status:** ✅ Concluído — aguardando aprovação  
**Regra:** Nenhuma migration executada. Nenhum código alterado.

**Fontes:** `001_init.sql`, `ryvon_supabase_schema_v1.sql`, Blueprint, Master Prompt, V8 Prototype, Handoff.

---

## 1. Arquitetura atual validada

### Stack (✅ alinhada ao Master Prompt)
Next.js 16 App Router · TypeScript · Tailwind 4 · Supabase · Zod · RHF · Recharts · date-fns · Vercel

### Camadas existentes
| Camada | Arquivos | Estado |
|--------|----------|--------|
| Rotas | 16 páginas + 3 dinâmicas | Funcional |
| Services | 6 + demo-state | Funcional |
| Domain | 8 módulos | Funcional (parcial vs Intelligence) |
| Actions | 18+ server actions | Funcional |
| Types | 15 entidades | Acoplado a `001_init` |
| Migration | `001_init.sql` única | Deployável |
| Auth | Supabase + flag bypass | Dev OK, prod pendente |
| Storage | `progress-photos` privado | OK, policies simplificadas |
| PWA | manifest + ícones | OK, tema light |

### Modelo de dados atual (monolítico)
```
profiles → fitness_settings
weeks → daily_logs → { meal_times, cardio_sessions, workout_sessions }
workout_templates → workout_template_exercises → exercises
workout_sessions → exercise_sessions → exercise_sets
weight_logs | progress_photos | health_notes | weekly_reports
```

### Modelo alvo (Blueprint / SQL oficial — normalizado)
```
profiles → user_settings
weeks → days → { sleep_logs, nutrition_logs, meal_time_logs, cardio_sessions, workout_sessions }
workout_templates → workout_template_exercises → warmup_protocols
workout_sessions → workout_exercise_sessions → workout_sets
weight_logs | body_measurements | progress_photos | weekly_checkins | notes | generated_insights (opc.)
+ views: v_weekly_cardio, v_weekly_sleep, v_weekly_nutrition
```

**Conclusão arquitetural:** A fundação de app (Next + services + domain + actions) é **sólida e preservável**. O gap principal é **normalização do schema** + **camada Intelligence** + **UI V8**.

---

## 2. Diff funcional — V8 Consolidated Master Prototype (oficial)

Legenda: ✅ existe · 🟡 parcial · ❌ não existe · 🎨 redesign visual

| Módulo V8 (Prototype + Master Prompt) | Rota atual | Status | Decisão |
|---------------------------------------|------------|--------|---------|
| Dashboard operacional | `/dashboard` | ✅ 🎨 | ADAPTAR layout V8, manter loaders |
| Calendar mensal | — | ❌ | ADICIONAR (`/calendario` ou widget) |
| Hoje / registro diário | `/hoje` | ✅ 🎨 | ADAPTAR + wellness (energy/fatigue/hunger/stress) |
| Semanas detalhadas | `/semana` | ✅ 🎨 | ADAPTAR |
| Treinos + templates | `/treinos` | ✅ 🎨 | ADAPTAR |
| Treino ao vivo | `/treinos/sessao/[id]` | ✅ | ADAPTAR UI |
| Warm-up / prep / recognition / work | schema parcial | 🟡 | MIGRAR schema + ADAPTAR services |
| Timer + descanso | session-client | ✅ | PRESERVAR |
| Histórico + PRs | `/treinos/exercicio/[id]` | ✅ | PRESERVAR + ADAPTAR progression labels |
| Nutrição + targets históricos | `/nutricao` | 🟡 | MIGRAR para `nutrition_logs` c/ targets |
| Cardio | `/cardio` | ✅ | ADAPTAR FK → `day_id` |
| Sono | `/sono` | ✅ | MIGRAR para `sleep_logs` |
| Progresso corporal | `/progresso` | 🟡 | ADAPTAR + medidas |
| Medidas corporais | — | ❌ | ADICIONAR |
| Fotos + comparador | `/fotos` | ✅ | ADAPTAR categorias enum |
| Notas dedicadas | em `/progresso` | 🟡 | ADICIONAR `/notas` ou seção V8 |
| Check-in semanal | — | ❌ | ADICIONAR |
| Timeline unificada | — | ❌ | ADICIONAR |
| Relatórios | `/relatorios` | ✅ 🎨 | PRESERVAR `weekly_reports` + ADAPTAR UI |
| Intelligence (Readiness, Trends, Anomaly, Correlation, Performance, Action) | — | ❌ | ADICIONAR domain + `/intelligence` |
| Configurações | `/configuracoes` | ✅ | ADAPTAR → `user_settings` |
| Quick Entry Cmd+K | global | ✅ | PRESERVAR |
| Autosave | hooks | ✅ | PRESERVAR |
| Compare semanas | `/semana`, `/relatorios` | ✅ | PRESERVAR |
| PWA | manifest | ✅ | ADAPTAR theme V8 |
| Auth prod | bypass ativo | 🟡 | ADAPTAR pós-infra |
| Demo/mock | demo-state | ✅ dev | PRESERVAR dev, não prod |

### Rotas V8 prototype → mapeamento (sem rename destrutivo)
| V8 view id | Rota atual | Ação |
|------------|------------|------|
| `dashboard` | `/dashboard` | PRESERVAR |
| `calendar` | *(nova)* | ADICIONAR |
| `today` | `/hoje` | PRESERVAR |
| `weeks` | `/semana` | PRESERVAR |
| `training` | `/treinos` | PRESERVAR |
| `nutrition` | `/nutricao` | PRESERVAR |
| `cardio` | `/cardio` | PRESERVAR |
| `sleep` | `/sono` | PRESERVAR |
| `body` | `/progresso` | PRESERVAR (expandir) |
| `photos` | `/fotos` | PRESERVAR |
| `notes` | *(nova ou expandir)* | ADICIONAR |
| `checkin` | *(nova)* | ADICIONAR |
| `intelligence` | *(nova)* | ADICIONAR |
| `reports` | `/relatorios` | PRESERVAR |
| `settings` | `/configuracoes` | PRESERVAR |
| `timeline` | *(nova, ou dentro de intelligence)* | ADICIONAR |

**NÃO migrar por inferência:** OAuth, `/inicio`, `/dieta`, hábitos, agenda SaaS, multi-tenant.

---

## 3. Diff completo de banco — tabela por tabela

### Legenda de classificação
`equiv` equivalente · `naming` naming diferente · `struct` estrutura diferente, mesma finalidade · `missing_col` · `missing_tbl` · `enum_div` · `constraint_div` · `fk_div` · `idx_div` · `rls_div` · `storage_div` · `migrate` · `backfill` · `keep_current` · `converge_blueprint`

---

### 3.1 Enums

| Item | 001_init | SQL oficial | Classificação | Decisão |
|------|----------|-------------|---------------|---------|
| `week_status` | `text check ('open','closed')` | `enum ('active','completed','archived')` | enum_div + naming | **MIGRAR** mapear open→active, closed→completed |
| `day_type` | `text check ('on','off')` | `enum ('on','off')` | enum_div | **CONVERGE** criar enum, migrar coluna |
| `training_status` | `text` variado | `enum` c/ `partial`, `rest` | enum_div | **MIGRAR** extra_rest→rest; add partial |
| `workout_set_type` | `prep` | `preparatory` | enum_div + naming | **MIGRAR** prep→preparatory no backfill |
| `warmup_type` | — | enum | missing_tbl | **ADICIONAR** |
| `weight_condition` | `fasted boolean` | enum | struct | **MIGRAR** |
| `photo_category` | text livre | enum (nomes invertidos) | enum_div | **MIGRAR** + **backfill** |
| `note_type` | text livre | enum (subset diferente) | enum_div | **MIGRAR** + mapear tipos atuais |
| `note_status` | text check | enum | enum_div | **CONVERGE** |

---

### 3.2 `profiles`

| Campo | 001 | Oficial | Classificação | Decisão |
|-------|-----|---------|---------------|---------|
| `id` | PK → profiles | PK → auth.users | equiv | **PRESERVAR** |
| `name` | NOT NULL | — | naming | **MIGRAR** → `display_name` nullable |
| `display_name` | — | text | missing_col | **ADICIONAR** + backfill from name |
| `avatar_url` | — | text | missing_col | **ADICIONAR** |
| `timezone` | — | default Fortaleza | missing_col | **ADICIONAR** |
| `updated_at` | — | timestamptz | missing_col | **ADICIONAR** |
| RLS | `for all` | select + update split | rls_div | **CONVERGE** (equivalente) |

---

### 3.3 `fitness_settings` × `user_settings`

| Campo 001 | Campo oficial | Classificação | Decisão |
|-----------|---------------|---------------|---------|
| `fitness_settings` | `user_settings` | naming | **MIGRAR** rename faseada |
| `weekly_cardio_goal` | `weekly_cardio_goal_minutes` | naming | **MIGRAR** |
| `on_*` / `off_*` | `day_on_*` / `day_off_*` | naming | **MIGRAR** |
| `adherence_weights` JSONB | `score_weight_*` colunas | struct | **MIGRAR** + backfill |
| `cardio_rpe_goal` | — | missing_col oficial | **MANTER ATUAL** coluna extra até decisão produto |
| `cycle_start_date` | — | missing_col oficial | **MANTER ATUAL** — crítico p/ `domain/week.ts` |
| `program_start_date` | — | missing_col oficial | **MANTER ATUAL** — crítico p/ semanas |
| `meal_plan` JSONB | — | missing_col oficial | **MANTER ATUAL** — usado em nutrição |
| FK → profiles | FK → auth.users | fk_div | **CONVERGE** (equivalente semântico) |
| RLS | equivalente | equiv | **PRESERVAR** padrão |

**Decisão técnica:** Renomear tabela e colunas **não** na mesma release que o split de days. Fase 1: ADD colunas blueprint; Fase 2: rename; Fase 3: drop JSONB se migrado.

---

### 3.4 `weeks`

| Campo | 001 | Oficial | Classificação | Decisão |
|-------|-----|---------|---------------|---------|
| Core | id, user_id, week_number, dates, notes | + created/updated_at | missing_col | **ADICIONAR** timestamps |
| `status` | open/closed text | week_status enum | enum_div | **MIGRAR** + backfill |
| `week_number` | NOT NULL | nullable | constraint_div | **ADAPTAR** manter NOT NULL (app depende) |
| Unique | `(user_id, week_number)` | `(user_id, start_date)` | constraint_div | **MANTER ATUAL** + add unique start_date se não conflitar |
| FK | → profiles | → auth.users | fk_div | **CONVERGE** |
| Index | `weeks_user_start_idx` | `idx_weeks_user_start` | idx_div | **equiv** |

---

### 3.5 `daily_logs` × `days` + `sleep_logs` + `nutrition_logs`

**Classificação global:** struct (monólito → normalizado) · **exige migration** · **exige backfill**

#### `daily_logs` → `days`
| Campo daily_logs | Destino oficial | Decisão |
|----------------|-----------------|---------|
| id, user_id, week_id, date, day_type | `days` | **MIGRAR** |
| activity_level (en) | activity_level (pt: Baixa/Média/Alta) | **MIGRAR** + backfill tradução |
| notes | `days.notes` | **MIGRAR** |
| last_meal_at | `days.last_meal_time` | **MIGRAR** |
| — | energy, fatigue, hunger, stress | **ADICIONAR** (V8 wellness) |
| — | training_status, training_template_id | **ADICIONAR** |
| sleep_* | `sleep_logs` | **MIGRAR** |
| calories, protein, carbs, fat | `nutrition_logs` | **MIGRAR** |
| meal_cutoff_hit | — (não no SQL) | **MANTER ATUAL** coluna em `nutrition_logs` ou computed |

#### `sleep_logs` (nova)
| Campo | Decisão |
|-------|---------|
| sleep_start/end `time` → `timestamptz` | **MIGRAR** + backfill com date+time |
| sleep_minutes → duration_minutes | **MIGRAR** |
| sleep_quality → quality | **MIGRAR** |

#### `nutrition_logs` (nova)
| Campo | Decisão |
|-------|---------|
| macros | **MIGRAR** de daily_logs |
| target_* | **ADICIONAR** + **backfill** snapshot do settings no dia (Blueprint rule) |

**Deprecação:** `daily_logs` → **DEPRECAR FUTURAMENTE** após dual-read/write e validação.

---

### 3.6 `meal_times` × `meal_time_logs`

| 001 | Oficial | Classificação | Decisão |
|-----|---------|---------------|---------|
| `daily_log_id` | `day_id` | fk_div | **MIGRAR** |
| `time` | `meal_time` | naming | **MIGRAR** |
| `position` | `sort_order` | naming | **MIGRAR** |
| — | `meal_name`, `user_id` | missing_col | **ADICIONAR** |
| RLS via join daily_logs | RLS user_id direto | rls_div | **CONVERGE** |

---

### 3.7 `cardio_sessions`

| 001 | Oficial | Classificação | Decisão |
|-----|---------|---------------|---------|
| `daily_log_id` | `day_id` | fk_div | **MIGRAR** |
| `type` | `modality` | naming | **MIGRAR** |
| `minutes` | `duration_minutes` | naming | **MIGRAR** |
| `timing` check EN | `timing` text livre | constraint_div | **CONVERGE** manter validação app-side |
| — | `started_at`, `updated_at` | missing_col | **ADICIONAR** |
| user_id | user_id | equiv | **PRESERVAR** |

---

### 3.8 `exercises`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| `muscle_group` | `primary_muscle` | **MIGRAR** rename + backfill |
| — | slug, secondary_muscles[], default_rest_seconds, is_custom, timestamps | **ADICIONAR** |

---

### 3.9 `workout_templates`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| `slug`, `order_index`, `is_rest` | — (não no SQL) | **MANTER ATUAL** — rotação Pull/Push/Lower depende |
| — | description, active, sort_order | **ADICIONAR** backfill sort_order←order_index |
| unique slug/order | unique name | **ADAPTAR** manter slug até refactor domain |

---

### 3.10 `workout_template_exercises`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| `position` | `sort_order` | **MIGRAR** |
| `instructions` | `notes` | **MIGRAR** |
| — | `user_id`, timestamps, unique(template, exercise) | **ADICIONAR** + backfill user_id |

---

### 3.11 `warmup_protocols`

| | Decisão |
|---|---------|
| Tabela inteira | **missing_tbl** · **ADICIONAR** · **exige migration** |
| Seed | Usar `seed_ryvon_personal` oficial |

---

### 3.12 `workout_sessions`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| `daily_log_id` | `day_id` | **MIGRAR** |
| `date` | *(via days.date)* | **MANTER ATUAL** coluna denormalizada p/ queries OU view |
| `completed_at` | `finished_at` | **MIGRAR** |
| `label` | — | **MANTER ATUAL** |
| `extra_rest` status | `rest` enum | **MIGRAR** |
| — | `partial` status | **ADICIONAR** |
| unique(user_id, date) | não existe | **MANTER ATUAL** constraint (1 sessão/dia no app) |

---

### 3.13 `exercise_sessions` × `workout_exercise_sessions`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| Nome tabela | naming | **MIGRAR** rename faseado |
| `status` pending/.../skipped | — (ausente) | **MANTER ATUAL** — UI treino ao vivo depende |
| `position` | `sort_order` | **MIGRAR** |
| — | `user_id`, `notes` | **ADICIONAR** |

---

### 3.14 `exercise_sets` × `workout_sets`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| Nome | naming | **MIGRAR** |
| `weight` | `weight_kg` | **MIGRAR** |
| `prep` | `preparatory` | **enum_div** · **backfill** |
| — | `completed`, `volume` generated, `notes`, `user_id` | **ADICIONAR** |
| unique | (session, set_number) implícito | unique(session, set_number, set_type) | **CONVERGE** |
| Warmup real | só `work` criado hoje | struct | **ADAPTAR** services p/ gerar warmup/prep/recognition |

**Progressão (Blueprint):** somente `work` conta — **PRESERVAR** lógica em `domain/progression.ts`, alinhar filtro.

---

### 3.15 `weight_logs`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| `weight` | `weight_kg` | **MIGRAR** |
| `fasted` boolean | `condition` enum | **MIGRAR** + **backfill** |
| unique(user, date) | unique(user, date, condition) | **constraint_div** · **CONVERGE** |

---

### 3.16 `body_measurements`

| | Decisão |
|---|---------|
| Tabela | **missing_tbl** · **ADICIONAR** |

---

### 3.17 `progress_photos`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| category text | photo_category enum | **enum_div** · **backfill** |
| weight | weight_kg | **MIGRAR** |
| — | notes, unique(user, storage_path) | **ADICIONAR** |

---

### 3.18 `health_notes` × `notes`

| 001 | Oficial | Decisão |
|-----|---------|---------|
| Nome | naming | **MIGRAR** |
| `note` | `text` | **MIGRAR** |
| date only | day_id, week_id optional | **ADICIONAR** FKs + backfill day_id |
| — | body_area | **ADICIONAR** |
| tipos extra (discomfort, event...) | enum menor | **MIGRAR** map→general ou estender enum |

---

### 3.19 `weekly_reports` × `generated_insights`

| | Decisão |
|---|---------|
| `weekly_reports` | **NÃO no Blueprint** · **MANTER ATUAL** — relatórios funcionam |
| `generated_insights` | **missing_tbl** · **ADICIONAR** opcional p/ cache Intelligence |
| Intelligence derivada | struct | **NÃO duplicar** scores em DB (Blueprint §3) |

---

### 3.20 `weekly_checkins`

| | Decisão |
|---|---------|
| Tabela | **missing_tbl** · **ADICIONAR** |

---

### 3.21 Views, seed, triggers

| Item | 001 | Oficial | Decisão |
|------|-----|---------|---------|
| `v_weekly_*` | — | 3 views | **ADICIONAR** |
| `seed_ryvon_personal()` | scripts/seed.ts TS | SQL function | **ADICIONAR** SQL + **ADAPTAR** seed TS |
| `handle_new_user` | name + fitness_settings | display_name + user_settings | **MIGRAR** trigger |
| updated_at triggers | 2 tabelas | 12+ tabelas | **ADICIONAR** |

---

### 3.22 RLS — comparação global

| Padrão 001 | Padrão oficial | Decisão |
|------------|----------------|---------|
| `auth.uid() = user_id` direct | idêntico | **CONVERGE** |
| Join policies (meal_times, sets...) | user_id em todas child tables | **CONVERGE** para user_id direto (simplifica) |
| profiles `for all` | select + update only | **CONVERGE** |
| 16 tabelas RLS | 21 tabelas RLS | **ADICIONAR** policies novas tabelas |

**Nenhuma regressão de segurança permitida.**

---

### 3.23 Storage

| | 001 | Oficial | Decisão |
|---|-----|---------|---------|
| Bucket | progress-photos private | idêntico | **PRESERVAR** |
| Path | `{user_id}/...` | `{user_id}/{year}/{month}/...` | **ADAPTAR** path no upload (não breaking) |
| Policies | 4 CRUD | 4 CRUD nomes diferentes | **equiv** · **CONVERGE** nomes |
| Limits | — | 10MB, mime types | **ADICIONAR** |

---

## 4. O que NÃO deve ser migrado / substituído

1. **Não DROP** `001_init` tabelas até fase de deprecação validada.
2. **Não substituir** `001_init.sql` pelo SQL oficial inteiro.
3. **Não remover** sem equivalente:
   - `cycle_start_date`, `program_start_date`, `meal_plan`, `cardio_rpe_goal`
   - `workout_templates.is_rest`, `slug`
   - `workout_sessions.label`, `date`, unique por dia
   - `exercise_sessions.status`
   - `weekly_reports`
   - `meal_cutoff_hit` (derivar ou coluna extra)
4. **Não renomear rotas** `/hoje`, `/nutricao`, etc.
5. **Não implementar** OAuth, hábitos, agenda SaaS por inferência.
6. **Não persistir** Intelligence scores duplicados (usar domain + optional `generated_insights`).

---

## 5. Backfills necessários

| Origem | Destino | Script |
|--------|---------|--------|
| `profiles.name` | `profiles.display_name` | UPDATE copy |
| `fitness_settings.*` | `user_settings.*` | INSERT…SELECT com rename cols |
| `adherence_weights` JSON | `score_weight_*` | parse JSON |
| `daily_logs` | `days` + `sleep_logs` + `nutrition_logs` | 1:1:1 split + targets snapshot |
| `meal_times` | `meal_time_logs` | join via day_id map |
| `cardio_sessions.daily_log_id` | `day_id` | FK remap |
| `workout_sessions.daily_log_id` | `day_id` | FK remap |
| `exercise_sets.set_type='prep'` | `'preparatory'` | UPDATE |
| `weight_logs.fasted` | `condition` enum | true→fasted, false→non_fasted |
| `progress_photos.category` | enum oficial | map relaxed_front→front_relaxed etc. |
| `health_notes` | `notes` | INSERT + type mapping |
| `weeks.status` | week_status enum | open→active, closed→completed |
| `activity_level` en | pt labels | low→Baixa… |
| Templates/exercises | sort_order, user_id, primary_muscle | column fills |

**Ordem:** backfill só após tabelas destino + colunas nullable/FK existirem.

---

## 6. Migrations incrementais propostas (não executar ainda)

### `002_v8_extensions.sql` — baixo risco
- CREATE TYPE enums (idempotent)
- ALTER `profiles` ADD columns
- ALTER `fitness_settings` ADD blueprint columns (parallel naming)
- CREATE `warmup_protocols`, `body_measurements`, `weekly_checkins`, `generated_insights`
- CREATE views `v_weekly_*`
- UPDATE storage bucket limits/policies
- RLS novas tabelas
- **Não toca** daily_logs ainda

### `003_v8_day_model.sql` — risco médio
- CREATE `days`, `sleep_logs`, `nutrition_logs`, `meal_time_logs`
- Backfill from `daily_logs`
- ADD `day_id` nullable em cardio_sessions, workout_sessions
- Backfill FKs
- Triggers sync opcional (dual-write period)
- **Manter** daily_logs readable

### `004_v8_training_alignment.sql` — risco médio
- ALTER exercises, workout_templates, template_exercises
- Populate warmup_protocols from seed logic
- CREATE `workout_exercise_sessions`, `workout_sets` OR rename via VIEW
- Backfill sets com prep→preparatory
- ADD warmup sets generation metadata

### `005_v8_settings_body_notes.sql`
- Rename/Migrate fitness_settings → user_settings (colunas)
- Migrate weight_logs, progress_photos categories
- Migrate health_notes → notes
- Preserve extension columns (cycle, meal_plan)

### `006_v8_cleanup_deprecate.sql` — **somente após QA**
- DROP views legacy
- DROP daily_logs, meal_times, exercise_sessions, exercise_sets (se 100% migrado)
- **Requer aprovação explícita + backup**

---

## 7. Plano visual (V8 oficial)

| Elemento | Atual | V8 | Sprint |
|----------|-------|-----|--------|
| Tokens | #F7F9FC light | #050A14 dark + light mode | Conv. S1 |
| Font | Plus Jakarta | Inter (+ display brand) | Conv. S1 |
| Sidebar | branca flat | glass + gradient active | Conv. S1 |
| Mobile nav | 5 itens | Início/Hoje/Treino/Progresso/Intelligence | Conv. S1-S2 |
| Dashboard | KPIs funcionais | hero + 6 KPIs + intelligence strip | Conv. S2 |
| Cards | brancos | surface + border + glow sutil | Conv. S1 |
| Login | card simples | split hero glass | Conv. S2 |
| Empty states | genéricos | copy oficial | Conv. S2+ |
| Intelligence UI | — | readiness ring, trends, anomalies | Conv. S6 |

**Princípio:** recomposição visual usando **mesmos loaders** até schema migrado.

---

## 8. Riscos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Split daily_logs quebra services | Alto | Dual-write + feature flag |
| Rename tables quebra types TS | Alto | Migration + PR types na mesma release |
| Perda dados prod | Crítico | Backup + backfill reversível |
| Demo mock desync schema | Médio | Atualizar mock-store após cada migration |
| Enum category photos | Médio | Mapping table temporária |
| is_rest removido acidentalmente | Alto | **MANTER** coluna explicitamente |
| weekly_reports vs derived | Baixo | Manter ambos |
| Auth bypass em prod | Alto | Gate antes go-live |
| Master Prompt sprint order vs convergence | Médio | Seguir ordem convergência abaixo |

---

## 9. Ordem definitiva dos próximos sprints (convergência)

> **Nota:** Numeração **Convergence Sprint** (CS), distinta do Master Prompt original (já parcialmente implementado).

| CS | Nome | Escopo | Depende de |
|----|------|--------|------------|
| **CS0** | Convergence Audit | ✅ este documento | — |
| **CS1** | Visual shell + tokens | globals, layout, nav, button, card, theme, PWA colors | aprovação CS0 |
| **CS2** | Auth prod + login V8 | middleware, env, login UI, signup se prompt exige | CS1 |
| **CS3** | Migration 002 | extensions sem split | CS2 + backup |
| **CS4** | Migration 003 + services day model | days split, backfill, refactor daily-log.service | CS3 |
| **CS5** | Migration 004 + training | warmup, workout_sets rename, session status | CS4 |
| **CS6** | Migration 005 + body/notes | measurements, checkins, notes, weight condition | CS5 |
| **CS7** | Páginas V8 core | calendar, checkin, notas, wellness fields | CS4+ |
| **CS8** | Analytics + reports UI | dashboard V8, timeline, compare | CS4+ |
| **CS9** | Intelligence layer | readiness, trends, anomalies, correlations, action engine | CS6+ |
| **CS10** | QA + deprecação | 006 cleanup, auth/RLS/storage QA | CS9 |

**Paradas obrigatórias:** após CS1, CS4, CS6, CS9 (reportar como Master Prompt exige).

---

## 10. Escopo exato do Sprint 1 (Convergence Sprint 1)

**Objetivo:** Aparência V8 + shell estável **sem** migration de schema **sem** refactor de services.

### Inclui
- [ ] Tokens CSS dark-first + light toggle (`#050A14`, `#0C6CFF`, `#00E2FF`, surfaces)
- [ ] `layout.tsx`: Inter via next/font
- [ ] Refactor visual: `sidebar`, `bottom-nav`, `button`, `card`, `input`, `page-header`
- [ ] Logo/wordmark placeholder ou asset se disponível
- [ ] `manifest.ts` + viewport theme-color V8
- [ ] Manter **todas** rotas e loaders intactos
- [ ] Build + lint + typecheck verdes

### Explicitamente exclui
- ❌ Migrations 002+
- ❌ Rename tabelas/colunas
- ❌ Novas rotas (intelligence, calendar, checkin)
- ❌ Refactor services/domain
- ❌ Reativar auth prod (CS2)
- ❌ shadcn reinstall (já tem componentes próprios — OK per impl atual)

### Critério de aceite CS1
1. App inteiro renderiza no shell V8 dark
2. Nenhuma regressão funcional (registrar peso, treino, hoje)
3. Mobile nav legível e usável
4. Demo mode continua funcionando

---

## 11. Matriz final Sprint 0

| | |
|---|---|
| **O QUE JÁ TEMOS** | App funcional completo em monólito `daily_logs`; treino ao vivo; domain aderência/progressão; 16 rotas; Supabase+RLS+Storage; demo fallback |
| **O QUE A V8 EXIGE** | Schema normalizado; warmup protocols; medidas; checkins; wellness; Intelligence engines; UI V8; calendar; timeline; targets históricos nutrição |
| **PRESERVAR** | Rotas PT, services/actions/domain (adaptar depois), weekly_reports, is_rest/slug/cycle/meal_plan, exercise session status, quick entry, autosave, demo dev |
| **ADAPTAR** | UI/shell, photo categories, activity levels, progression prep→preparatory, storage paths |
| **MIGRAR** | daily_logs split, settings rename, workout table renames, FKs daily_log→day_id, enums |
| **ADICIONAR** | days, sleep_logs, nutrition_logs, meal_time_logs, warmup_protocols, body_measurements, weekly_checkins, notes model, generated_insights, views, intelligence domain, calendar, checkin, /intelligence |
| **DEPRECAR FUTURO** | daily_logs, meal_times, exercise_sessions, exercise_sets, health_notes, fitness_settings name |
| **MIGRATIONS** | 002→006 incremental; **não** replace 001 |
| **ORDEM** | CS1 visual → CS2 auth → CS3-CS6 schema → CS7-CS9 features → CS10 QA |

---

**FIM DO SPRINT 0 — AGUARDANDO APROVAÇÃO PARA CS1.**
