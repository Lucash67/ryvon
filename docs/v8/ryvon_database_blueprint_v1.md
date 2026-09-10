# RYVON Database Blueprint v1

## 1. Objetivo

Este documento congela a arquitetura de dados da RYVON para a transição do protótipo local para uma aplicação real com **Supabase Auth + PostgreSQL + Storage + RLS**.

A regra principal é:

> UI registra dados. Serviços aplicam regras. PostgreSQL persiste. Intelligence deriva métricas. Componentes não concentram regra de negócio.

---

## 2. ERD lógico

```text
auth.users
   │
   ├── profiles
   ├── user_settings
   │
   ├── weeks
   │     └── days
   │          ├── sleep_logs
   │          ├── nutrition_logs
   │          ├── meal_time_logs
   │          ├── cardio_sessions
   │          └── workout_sessions
   │                 └── workout_exercise_sessions
   │                         └── workout_sets
   │
   ├── exercises
   │
   ├── workout_templates
   │     └── workout_template_exercises
   │             └── warmup_protocols
   │
   ├── weight_logs
   ├── body_measurements
   ├── progress_photos
   ├── weekly_checkins
   ├── notes
   └── generated_insights (opcional)
```

---

## 3. Decisões arquiteturais congeladas

### Usuário
`profiles.id = auth.users.id`.

Isso evita um UUID adicional para perfil.

### Week → Day
A semana é uma entidade real, mas o dia também possui `user_id`. Isso simplifica RLS e consultas.

### Targets históricos
`nutrition_logs` salva a meta usada naquele dia. Se o nutricionista mudar as metas depois, o histórico antigo não muda retroativamente.

### Warm-up separado de work set
`workout_sets.set_type` distingue:

- warmup
- preparatory
- recognition
- work

**Somente `work` entra por padrão em progressão e volume efetivo.**

### Volume
O banco calcula automaticamente:

```text
weight_kg × reps
```

por série.

### Intelligence
Médias, tendências, scores, correlações e anomalias são **dados derivados**. Não devem ser duplicados em tabelas sem necessidade.

`generated_insights` existe apenas para persistir insights quando isso passar a ser necessário.

---

## 4. Tabelas

### Núcleo
- `profiles`
- `user_settings`
- `weeks`
- `days`

### Registro diário
- `sleep_logs`
- `nutrition_logs`
- `meal_time_logs`
- `cardio_sessions`

### Treino
- `exercises`
- `workout_templates`
- `workout_template_exercises`
- `warmup_protocols`
- `workout_sessions`
- `workout_exercise_sessions`
- `workout_sets`

### Corpo
- `weight_logs`
- `body_measurements`
- `progress_photos`

### Acompanhamento
- `weekly_checkins`
- `notes`

### Intelligence
- `generated_insights` (opcional)

---

## 5. Segurança

Todas as tabelas pessoais usam **Row Level Security**.

Regra:

```sql
user_id = auth.uid()
```

Para `profiles`:

```sql
id = auth.uid()
```

A RYVON nunca deve depender apenas de filtros no frontend para separar usuários.

---

## 6. Storage

Bucket privado:

```text
progress-photos
```

Estrutura:

```text
{user_id}/{year}/{month}/{uuid}.webp
```

A primeira pasta do objeto deve ser exatamente o `auth.uid()`.

Políticas impedem leitura, gravação, edição ou exclusão de arquivos de outro usuário.

---

## 7. Auth bootstrap

Ao criar um usuário:

1. cria `profiles`;
2. cria `user_settings`;
3. aplica defaults da RYVON;
4. o frontend pode executar o seed pessoal opcional.

Trigger:

```text
on_auth_user_created
```

---

## 8. Seed pessoal

Função:

```sql
select public.seed_ryvon_personal(auth.uid());
```

Inclui inicialmente:

- cardio 200 min/semana;
- sono 450 min;
- cutoff 21:30;
- Day On 2270 / P146 / C322 / G44;
- Day Off 2060 / P142 / C279 / G43;
- pesos 69,6 kg em 31/08/2026 e 69,0 kg em 07/09/2026;
- templates Pull, Push, Lower A, Upper e Lower B;
- biblioteca dos exercícios já mapeados;
- estrutura inicial de warm-up / preparatória / reconhecimento.

O seed é **idempotente** onde possível para evitar duplicação.

---

## 9. Views derivadas iniciais

O SQL inclui:

- `v_weekly_cardio`
- `v_weekly_sleep`
- `v_weekly_nutrition`

Elas usam `security_invoker = true`, preservando a segurança do usuário chamador.

---

## 10. Motor de treino

A camada TypeScript deverá ter:

```text
analyzeSetProgression()
getExerciseHistory()
getPreviousWorkSets()
calculateExerciseVolume()
calculateSessionVolume()
```

Retornos de progressão:

```text
load_pr
rep_pr
volume_pr
equal
performance_drop
insufficient_data
```

O banco persiste dados; a lógica de classificação fica no domínio da aplicação.

---

## 11. Motor de aderência

Pesos iniciais:

```text
Training  30%
Nutrition 25%
Sleep     20%
Cardio    15%
Routine   10%
```

Os pesos ficam em `user_settings`.

O score final deve ser limitado a 100.

---

## 12. RYVON Readiness

Métrica interna, não médica.

Modelo inicial:

```text
Sleep      35%
Nutrition  25%
Energy     15%
Fatigue    15%
Cardio     10%
```

Interface deve chamar explicitamente:

```text
RYVON Readiness
```

---

## 13. Trend Engine

Janelas:

- 7D
- 14D
- 30D
- 90D

Saída padrão:

```ts
{
  currentAverage,
  previousAverage,
  delta,
  percentageChange,
  direction
}
```

---

## 14. Anomaly Engine

Primeira versão:

```text
z-score
abs(z) >= 1.5
sample >= 4
```

Não usar ML nesta fase.

---

## 15. Correlation Engine

Primeira versão:

```text
Pearson correlation
```

Toda correlação deve retornar:

- `r`
- `sampleSize`
- força
- direção
- aviso de não causalidade

A linguagem da UI nunca deve afirmar causalidade com base apenas em correlação.

---

## 16. Índices obrigatórios

O schema já cria índices para:

- semanas por usuário/data;
- dias por usuário/data;
- cardio por dia;
- templates;
- sessões de treino;
- séries;
- peso;
- medidas;
- fotos;
- notas;
- insights.

---

## 17. Regras de unidade

Persistência:

```text
peso         kg
medidas      cm
sono         minutos
cardio       minutos
descanso     segundos
datas        date
timestamps   timestamptz
```

A interface apenas formata.

---

## 18. Timezone

Timezone padrão do perfil:

```text
America/Fortaleza
```

Timestamps ficam em UTC no banco e são apresentados no timezone do usuário.

---

## 19. Ordem de implementação

### Migration 0001
Profiles + Settings + Auth bootstrap.

### Migration 0002
Weeks + Days.

### Migration 0003
Sleep + Nutrition + Meals + Cardio.

### Migration 0004
Exercises + Templates + Warm-up.

### Migration 0005
Workout Sessions + Exercises + Sets.

### Migration 0006
Weight + Measurements + Photos + Storage.

### Migration 0007
Check-ins + Notes.

### Migration 0008
Indexes + RLS + Views + Seed.

---

## 20. Critérios de aceite do backend

### Persistência
Registrar algo no celular, atualizar a página e abrir no computador deve retornar o mesmo dado.

### RLS
Um usuário não pode ler nem modificar nenhum dado de outro usuário, mesmo tentando acessar a API diretamente.

### Treino
Finalizar uma sessão deve manter:
- template usado;
- exercícios;
- ordem;
- sets;
- tipo de set;
- carga;
- reps;
- RIR;
- notas;
- duração.

### Nutrição
Alterar a meta futura não pode reescrever os targets já registrados em dias anteriores.

### Fotos
O banco guarda somente metadados e `storage_path`. A imagem fica no bucket privado.

### Intelligence
Sem histórico suficiente, retornar `insufficient_data`, nunca métricas falsas.

---

## 21. O que não fazer

- não usar `localStorage` como banco principal;
- não hardcodar semanas;
- não hardcodar gráficos;
- não calcular score dentro de componentes;
- não misturar warm-up com work set;
- não guardar imagem base64 no PostgreSQL;
- não expor bucket de progresso publicamente;
- não confiar em `user_id` enviado pelo cliente sem RLS;
- não alterar dados históricos quando settings mudarem;
- não gerar “insights” sem dados;
- não afirmar causalidade a partir de correlação.

---

## 22. Próximo passo

Com este blueprint fechado, a etapa seguinte é o:

# RYVON Cursor Master Implementation Prompt

Esse prompt deverá mandar o Cursor implementar o sistema por sprints, usando este SQL como contrato de banco e sem redesenhar o produto.
