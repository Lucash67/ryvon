# RYVON — CURSOR MASTER IMPLEMENTATION PROMPT v1

Você está assumindo a implementação real da **RYVON**, uma aplicação pessoal de acompanhamento de evolução física que já passou por discovery, product design, prototipagem funcional, mapeamento de dados, inteligência e arquitetura técnica.

Sua função agora **não é redesenhar o produto**, inventar funcionalidades, mudar branding ou reinterpretar a arquitetura.

Sua função é **implementar fielmente o produto já definido**, usando os arquivos anexos como contratos oficiais.

---

# 1. FONTES OFICIAIS E HIERARQUIA DE AUTORIDADE

Você receberá junto deste prompt os seguintes arquivos:

1. `ryvon_database_blueprint_v1.md`
2. `ryvon_supabase_schema_v1.sql`

Considere-os como **contratos oficiais**.

Hierarquia de decisão:

1. SQL oficial
2. Database Blueprint
3. Este Master Prompt
4. Decisões locais de implementação

Se houver conflito entre alguma interpretação sua e os arquivos oficiais, **os arquivos oficiais vencem**.

Não altere schema, nomenclatura, regras ou relações sem necessidade técnica real.

Se identificar uma inconsistência técnica:
- não faça mudanças silenciosas;
- documente o problema;
- proponha a menor correção possível;
- preserve a intenção original.

---

# 2. OBJETIVO DO PROJETO

Transformar a RYVON de protótipo HTML/localStorage em uma aplicação real, persistente, autenticada, sincronizada e pronta para uso diário.

A RYVON deve permitir que o usuário acompanhe:

- treino
- nutrição
- cardio
- sono
- rotina
- peso
- medidas
- fotos
- notas
- check-ins
- aderência
- comparações
- timeline
- relatórios
- PRs
- histórico de exercícios
- trends
- anomalias
- readiness
- intelligence
- prioridades acionáveis

---

# 3. STACK OFICIAL

Use:

## Frontend
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui

## Formulários
- React Hook Form
- Zod

## Banco / Backend
- Supabase
- PostgreSQL

## Auth
- Supabase Auth

## Storage
- Supabase Storage

## Gráficos
- Recharts

## Datas
- date-fns

## Deploy
- Vercel

## PWA
- manifest
- installability
- service worker posteriormente

Não introduza outra stack sem necessidade.

---

# 4. PRINCÍPIO ARQUITETURAL

Componentes NÃO concentram regra de negócio.

Exemplo errado:

```tsx
<WeeklyScoreCard />
```

calculando internamente aderência.

Exemplo correto:

```text
lib/ryvon/adherence.ts
```

calcula e o componente apenas recebe:

```tsx
<WeeklyScoreCard score={84} />
```

Mesma regra para:

- readiness
- PR
- progression
- trends
- anomalies
- correlations
- nutrition adherence
- cardio adherence
- reports
- weekly summaries
- intelligence

---

# 5. ESTRUTURA DE PASTAS ESPERADA

Use como referência:

```text
src/

app/
  (auth)/
    login/
    signup/

  (app)/
    dashboard/
    today/
    calendar/
    weeks/
    training/
    nutrition/
    cardio/
    sleep/
    body/
    checkin/
    compare/
    timeline/
    notes/
    intelligence/
    reports/
    settings/

components/
  ryvon/
    dashboard/
    training/
    nutrition/
    cardio/
    sleep/
    body/
    intelligence/
    reports/

lib/
  supabase/
    client.ts
    server.ts
    middleware.ts

  ryvon/
    adherence.ts
    readiness.ts
    progression.ts
    trends.ts
    anomalies.ts
    correlations.ts
    reports.ts
    nutrition.ts
    training.ts
    dates.ts

services/
  daily-log.service.ts
  week.service.ts
  workout.service.ts
  body.service.ts
  intelligence.service.ts

schemas/
  day.schema.ts
  workout.schema.ts
  body.schema.ts
  checkin.schema.ts

types/
  database.ts
  domain.ts
```

Você pode ajustar organização interna se necessário, mas preserve separação clara entre:

- UI
- domínio
- serviços
- acesso a dados
- schemas
- tipos

---

# 6. DESIGN E BRANDING

A marca oficial é:

**RYVON**

Tagline visual oficial:

**EVOLUÇÃO EM MOVIMENTO.**

Direção visual:
- premium
- health-tech
- tecnológica
- profissional
- minimalista
- madura
- sem estética de academia clichê
- sem vermelho/neon agressivo
- sem excesso de gradientes em cada card

Paleta-base:
- Deep Navy
- Blue
- Cyan
- Ice White
- Slate
- Gray
- Amber
- Red apenas para alerta/erro

Gradiente oficial:
**azul → ciano**

Não redesenhe a marca.

Não troque logo.

Não altere naming.

---

# 7. IDENTIDADE DE PRODUTO

A RYVON possui três camadas conceituais:

```text
TRACK
registre

UNDERSTAND
entenda

EVOLVE
aja
```

O produto deve transmitir:

- controle
- consistência
- evolução
- precisão
- recuperação
- performance
- dados
- clareza

Evite linguagem como:
- "summer body"
- "no excuses"
- "grind"
- "beast mode"

Prefira linguagem madura.

---

# 8. BANCO DE DADOS

Use `ryvon_supabase_schema_v1.sql` como base oficial.

NÃO:
- renomeie tabelas;
- remova campos;
- mude enums;
- altere relações;
- troque RLS por filtros no frontend;
- exponha fotos publicamente;
- transforme imagens em base64 no banco.

Toda persistência deve seguir o schema oficial.

---

# 9. SEGURANÇA

RLS é obrigatório.

Regra absoluta:

```text
user_id = auth.uid()
```

Para profiles:

```text
id = auth.uid()
```

Não confie apenas em filtros do frontend.

Teste explicitamente que:
- usuário A não lê dados de usuário B;
- usuário A não edita dados de usuário B;
- usuário A não deleta dados de usuário B;
- Storage também respeita isolamento.

---

# 10. AUTH

Fluxo inicial:

```text
/
↓
login ou criar conta
↓
Supabase Auth
↓
profile
↓
user_settings
↓
dashboard
```

Primeira versão:
- email
- senha

Não implementar Google/Apple agora.

Middleware deve proteger as rotas autenticadas.

---

# 11. PERSISTÊNCIA

Substituir completamente o localStorage como banco principal.

localStorage pode ser usado no máximo para:
- tema
- preferências de UI
- estado transitório não crítico

Dados de negócio devem viver no Supabase.

---

# 12. UNIDADES

Persistir:

```text
peso         kg
medidas      cm
sono         minutos
cardio       minutos
descanso     segundos
datas        date
timestamps   timestamptz
```

A interface formata.

Não espalhar conversões inconsistentes.

---

# 13. TIMEZONE

Timezone padrão:

```text
America/Fortaleza
```

Banco:
UTC / timestamptz.

Interface:
converter para timezone do usuário.

---

# 14. DAILY LOG

A tela Hoje deve permitir:

- sono
- qualidade do sono
- atividade
- energia
- fadiga
- fome
- estresse
- última refeição
- observações
- calorias
- proteína
- carboidratos
- gorduras
- múltiplas sessões de cardio
- múltiplos horários de refeição
- treino programado
- status do treino

Salvar progressivamente.

Autosave:
- debounce 500–800ms para campos simples

Ações explícitas:
- finalizar treino
- excluir
- upload
- operações destrutivas

---

# 15. DAY ON / DAY OFF

O sistema deve respeitar:

## Day On
- 2270 kcal
- P 146
- C 322
- G 44

## Day Off
- 2060 kcal
- P 142
- C 279
- G 43

Esses valores são defaults iniciais.

Devem ser editáveis em Settings.

Ao registrar um dia, salve os targets daquele dia no `nutrition_logs`.

Se settings mudarem depois, histórico antigo NÃO pode mudar retroativamente.

---

# 16. CARDIO

Meta inicial:
**200 min/semana**

Cada sessão:
- modalidade
- duração
- RPE
- timing
- notas
- started_at opcional

O sistema deve calcular:
- total diário
- total semanal
- aderência
- distribuição por dia
- modalidade mais usada
- média RPE

Nunca tratar gasto calórico estimado como valor exato.

---

# 17. SONO

Registrar:
- sleep_start
- sleep_end
- duration_minutes
- quality
- notes

Meta inicial:
450 min = 7h30.

O app calcula duração.

Médias:
- semanal
- mínima
- máxima

---

# 18. TREINO — REGRA CRÍTICA

O treino precisa diferenciar:

```text
warmup
preparatory
recognition
work
```

Somente `work` entra por padrão em:
- progressão
- PR
- volume efetivo
- análise principal

Não misture warm-up com work set.

---

# 19. SPLIT INICIAL

Seed inicial:

```text
Pull
Push
Lower A
Rest
Upper
Lower B
Rest
```

Templates reais:
- Pull
- Push
- Lower A
- Upper
- Lower B

Não faça o usuário recriar tudo manualmente.

---

# 20. EXERCISE LIBRARY

Use os exercícios do seed oficial.

Cada exercício deve ter:
- nome
- grupo muscular
- descanso
- instruções
- histórico

Permitir criação de exercício personalizado.

---

# 21. WORKOUT SESSION

Fluxo:

```text
abrir template
↓
iniciar treino
↓
executar exercícios
↓
registrar sets
↓
timer de descanso
↓
finalizar
↓
salvar
↓
histórico atualizado
↓
PR recalculado
```

Persistir:
- started_at
- finished_at
- duração
- status
- notas
- exercícios
- sets
- RIR
- peso
- reps

---

# 22. PROGRESSION ENGINE

Criar função:

```ts
analyzeSetProgression()
```

Retornos:

```text
load_pr
rep_pr
volume_pr
equal
performance_drop
insufficient_data
```

Regras:

## REP PR
mesmo peso + mais reps

## LOAD PR
peso maior com performance relevante dentro da faixa

## VOLUME PR
peso × reps maior

## PERFORMANCE DROP
performance inferior ao comparável anterior

Não tratar automaticamente como regressão.

A Intelligence contextualiza.

---

# 23. PESO

Seed:
- 31/08/2026 → 69.6 kg
- 07/09/2026 → 69.0 kg

Mostrar:
- atual
- inicial
- variação
- média móvel
- gráfico
- tendência

---

# 24. MEDIDAS

Campos:
- cintura
- abdômen
- peito
- braço
- coxa
- quadril

Mostrar histórico.

---

# 25. FOTOS

Bucket privado:

```text
progress-photos
```

Path:

```text
{user_id}/{year}/{month}/{uuid}.webp
```

Antes do upload:
- reduzir imagem
- max width aproximada 1600px
- converter WebP
- manter boa qualidade

Banco guarda apenas:
- metadata
- storage_path

Nunca base64.

---

# 26. CHECK-IN

Campos:
- peso
- energia
- fome
- recuperação
- avaliação da semana
- observação

Histórico deve ser navegável.

---

# 27. NOTES

Tipos:
- pain
- fatigue
- illness
- travel
- different_gym
- free_meal
- sleep
- stress
- general

Status:
- active
- improving
- resolved

---

# 28. ADHERENCE ENGINE

Pesos iniciais:

```text
Training  30%
Nutrition 25%
Sleep     20%
Cardio    15%
Routine   10%
```

Configurable via settings.

Score final:
máximo 100.

---

# 29. NUTRITION SCORE

Modelo inicial:

```text
calorie_adherence × 50%
protein_adherence × 35%
macro_consistency × 15%
```

Não premiar simplesmente comer menos.

Aderência significa proximidade ao plano.

---

# 30. TRAINING SCORE

```text
completed_planned_sessions
/
planned_sessions
```

× 100

---

# 31. CARDIO SCORE

```text
weekly_minutes
/
weekly_goal
```

cap em 100.

---

# 32. SLEEP SCORE

Versão inicial:

```text
average_sleep_minutes
/
sleep_goal_minutes
```

cap em 100.

---

# 33. ROUTINE SCORE

Primeiro sinal:
- aderência ao meal cutoff

Pode incluir futuramente:
- check-in
- dias completos
- consistência

---

# 34. RYVON READINESS

Não é métrica médica.

Nome oficial:
**RYVON Readiness**

Modelo inicial:

```text
Sleep      35%
Nutrition  25%
Energy     15%
Fatigue    15%
Cardio     10%
```

---

# 35. TREND ENGINE

Janelas:
- 7D
- 14D
- 30D
- 90D

Função:

```ts
calculateTrend(metric, window)
```

Saída:

```ts
{
  currentAverage,
  previousAverage,
  delta,
  percentageChange,
  direction
}
```

direction:
- up
- down
- stable

---

# 36. ANOMALY ENGINE

Primeira versão estatística.

```text
abs(z-score) >= 1.5
sample >= 4
```

Não usar ML agora.

Possíveis sinais:
- sono anormalmente baixo
- fadiga alta
- energia baixa
- calorias fora do padrão
- peso fora da tendência
- cardio concentrado
- performance muito abaixo da sessão comparável

---

# 37. CORRELATION ENGINE

Pearson inicialmente.

Sempre retornar:
- r
- sampleSize
- força
- direção

Exemplo:

```text
r = 0.52
moderate positive association
n = 24
```

Nunca afirmar causalidade.

---

# 38. REGRA DE LINGUAGEM DA INTELLIGENCE

NUNCA:

> Dormir pouco causou sua queda de performance.

PREFERIR:

> Nos seus registros, noites mais curtas apareceram junto de menor performance em algumas sessões.

Toda insight deve respeitar essa regra.

---

# 39. INTELLIGENCE SERVICE

Criar:

```ts
getWeeklyIntelligence(weekId)
```

Retorno esperado:

```ts
{
  readiness,
  trends,
  anomalies,
  correlations,
  performanceSignals,
  priorities
}
```

---

# 40. DAILY LOG SERVICE

Criar:

```ts
getDailySummary(date)
```

Retorno:

```ts
{
  date,
  dayType,
  training,
  sleep,
  nutrition,
  cardio,
  wellness,
  adherence
}
```

---

# 41. WEEK SERVICE

Criar:

```ts
getWeeklySummary(weekId)
```

Retornar:
- sono médio
- calorias médias
- proteína média
- cardio total
- aderência de treino
- aderência de rotina
- peso
- RYVON score

---

# 42. DASHBOARD

Não fazer 20 queries independentes sem necessidade.

Criar serviço agregador do dashboard.

Retorno esperado:

```ts
{
  today,
  week,
  weight,
  adherence,
  readiness,
  priorities
}
```

---

# 43. CALENDAR

Calendário deve:
- navegar meses
- exibir dias
- mostrar treino programado
- sinalizar conclusão
- abrir dia
- permitir edição
- refletir dados persistidos

Nada hardcoded.

---

# 44. COMPARE

Permitir:
- Semana A × Semana B
- métricas
- aderência
- sono
- cardio
- proteína
- calorias
- peso
- fotos

---

# 45. TIMELINE

Timeline unifica:
- peso
- PRs
- treinos
- notas
- dor
- check-ins
- medidas
- fotos

Ordenação cronológica.

---

# 46. REPORTS

Relatório semanal deve ser derivado dos dados reais.

Nunca hardcoded.

Mostrar:
- resumo
- treino
- sono
- cardio
- nutrição
- peso
- aderência
- insights
- prioridades

---

# 47. EMPTY STATES

Implementar bons estados vazios.

Exemplos:

Sem peso:
> Seu gráfico começa no primeiro check-in.

Sem treino:
> Complete sua primeira sessão para iniciar o histórico.

Sem foto:
> Adicione sua primeira foto de progresso.

Sem Intelligence:
> Ainda não há dados suficientes para gerar esta análise.

---

# 48. LOADING STATES

Nada deve “piscar” sem feedback.

Use:
- skeletons
- loading states
- disabled states
- optimistic UI quando seguro

---

# 49. ERROR HANDLING

Padronizar:
- success
- warning
- error
- loading

Nunca falhar silenciosamente.

---

# 50. OPTIMISTIC UI

Para registros simples:
- atualizar UI imediatamente
- persistir
- rollback em caso de erro
- toast

---

# 51. PWA

Não precisa ser o primeiro sprint.

Mas não crie uma arquitetura que impeça:
- installability
- offline queue futura
- notificações

---

# 52. RESPONSIVIDADE

Prioridade:
**mobile-first**

O uso principal tende a ocorrer no celular.

Mas desktop também deve ser excelente.

A interface deve funcionar muito bem em:
- 360px
- 390px
- 430px
- tablet
- desktop

---

# 53. NÃO FAZER

É proibido:

- redesenhar a RYVON do zero
- mudar branding
- mudar logo
- inventar métricas novas sem necessidade
- hardcodar semanas
- hardcodar gráficos
- hardcodar dados fake
- usar localStorage como banco
- espalhar regra em componentes
- duplicar lógica
- misturar warm-up e work set
- expor bucket de fotos
- guardar imagem base64 no banco
- alterar histórico ao mudar settings
- mostrar insight sem dados suficientes
- afirmar causalidade a partir de correlação
- criar features de SaaS multiusuário agora
- criar coach dashboard agora
- criar pagamentos agora
- criar comunidade agora

---

# 54. SPRINT PLAN

Implemente em sprints.

Não tente finalizar tudo de uma vez.

---

# SPRINT 1 — FUNDAÇÃO

Objetivo:
ter app real autenticado com Supabase.

Implementar:
- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Supabase client/server
- env
- Auth
- login
- signup
- middleware
- profiles
- user_settings
- migrations
- RLS
- shell principal
- sidebar
- mobile navigation
- theme
- seed pessoal

Critério de aceite:
- usuário cria conta
- login funciona
- logout funciona
- profile/settings existem
- rotas protegidas
- dados isolados por RLS
- app abre dashboard autenticado

PARAR após Sprint 1 e reportar:
- arquivos criados
- migrations
- problemas
- testes
- próximos passos

Não avance silenciosamente para Sprint 2.

---

# SPRINT 2 — CORE DAILY SYSTEM

Implementar:
- weeks
- days
- calendar
- today
- sleep
- nutrition
- meal times
- cardio
- wellness
- autosave
- settings day on/off

Critério de aceite:
- criar/abrir dia
- registrar tudo
- atualizar página
- dados permanecem
- abrir outro dispositivo
- mesmos dados aparecem

PARAR e reportar.

---

# SPRINT 3 — TRAINING ENGINE

Implementar:
- exercise library
- workout templates
- warmup protocols
- workout sessions
- exercise sessions
- sets
- rest timer
- notes
- history
- PRs
- progression engine

Critério:
- iniciar treino
- preencher sets
- warm-up separado
- finalizar
- persistir
- abrir histórico
- PR calculado

PARAR e reportar.

---

# SPRINT 4 — BODY & PROGRESS

Implementar:
- weight logs
- moving average
- measurements
- progress photos
- Storage
- image compression
- check-in

Critério:
- registrar peso no celular
- abrir desktop
- gráfico atualizado
- upload de foto funciona
- foto protegida por RLS/Storage policy

PARAR e reportar.

---

# SPRINT 5 — ANALYTICS

Implementar:
- dashboard agregado
- adherence
- weekly summaries
- compare
- timeline
- reports
- charts

Critério:
- todos os números vêm do banco
- nenhum hardcoded
- comparação real entre semanas
- relatório recalculado

PARAR e reportar.

---

# SPRINT 6 — INTELLIGENCE

Implementar:
- readiness
- trend engine
- anomaly engine
- correlation engine
- performance intelligence
- action engine

Critério:
- sem dados → insufficient_data
- com dados → análise coerente
- correlações mostram sample size
- linguagem não causal
- prioridades ordenadas

PARAR e reportar.

---

# SPRINT 7 — PWA / PRODUCTION POLISH

Implementar:
- manifest
- installability
- loading states
- empty states
- error handling
- mobile polish
- performance
- accessibility
- SEO básico
- favicon
- OG
- production env

PARAR e reportar.

---

# SPRINT 8 — QA FINAL

Somente depois de tudo acima.

Fazer:
- mobile QA
- desktop QA
- auth QA
- RLS QA
- storage QA
- schema QA
- performance QA
- edge cases
- regressions
- polish visual
- bugs

Essa é a fase onde ajustes finos entram.

---

# 55. CRITÉRIOS DE ACEITE GLOBAIS

A aplicação só é considerada pronta quando:

1. não depende de localStorage para dados de negócio;
2. todos os registros persistem;
3. sincroniza entre dispositivos;
4. RLS está validada;
5. fotos são privadas;
6. treino persiste corretamente;
7. warm-up e work set estão separados;
8. histórico de PR funciona;
9. targets antigos não mudam;
10. dashboard não usa fake data;
11. relatórios são derivados;
12. Intelligence não inventa dados;
13. mobile funciona muito bem;
14. desktop funciona muito bem;
15. usuário consegue viver uma semana inteira no app sem Notion.

---

# 56. FORMA DE TRABALHO

Antes de alterar código:

1. leia este prompt completo;
2. leia `ryvon_database_blueprint_v1.md`;
3. leia `ryvon_supabase_schema_v1.sql`;
4. inspecione o repositório atual;
5. liste o estado encontrado;
6. identifique o sprint atual;
7. proponha o plano mínimo daquele sprint;
8. só então implemente.

Durante a implementação:

- centralize regras;
- preserve arquitetura;
- faça commits lógicos;
- evite refactors não relacionados;
- não mexa no que já funciona sem necessidade;
- mantenha build verde;
- mantenha TypeScript sem erros;
- não deixe TODOs críticos ocultos.

---

# 57. CHECKPOINT OBRIGATÓRIO AO FINAL DE CADA SPRINT

Ao terminar um sprint, responda neste formato:

## Sprint concluído
Nome do sprint

## Implementado
Lista objetiva

## Arquivos principais alterados
Lista

## Migrations
Lista

## Testes realizados
Lista

## Build
Resultado

## RLS / Segurança
Resultado

## Pendências
Lista

## Próximo sprint recomendado
Nome

E então **pare**.

Não avance automaticamente.

---

# 58. PRIMEIRA TAREFA AGORA

Comece somente pelo:

# SPRINT 1 — FUNDAÇÃO

Implemente:

- Supabase
- Auth
- login/signup
- middleware
- profiles
- settings
- migrations
- RLS
- shell da aplicação
- tema
- seed pessoal
- dashboard autenticado inicial

Não implemente ainda:
- training engine
- intelligence
- body
- reports
- photos
- PWA

Primeiro precisamos de uma fundação estável.

Quando concluir, pare e entregue o checkpoint do Sprint 1.
