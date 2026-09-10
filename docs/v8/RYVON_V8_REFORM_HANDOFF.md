# RYVON — V8 REFORM HANDOFF

## Contexto crítico

A RYVON já existe como aplicação em desenvolvimento e possui uma versão publicada:

- Produção atual: https://ryvon-app.vercel.app/dashboard
- Esta entrega representa uma REFORMA COMPLETA + CONVERGÊNCIA.
- Não é um projeto novo e não deve ser tratado como rebuild.

O objetivo é transformar progressivamente o sistema atual na nova referência oficial da RYVON, preservando toda fundação útil, domínio, serviços, actions, persistência e componentes que já estejam corretos.

## Arquivos oficiais deste handoff

Leia nesta ordem:

1. RYVON_CURSOR_MASTER_IMPLEMENTATION_PROMPT_v1.md
2. ryvon_database_blueprint_v1.md
3. ryvon_supabase_schema_v1.sql
4. ryvon_v8_consolidated_master_prototype.html

### Papel de cada arquivo

**Master Implementation Prompt**
- contrato de implementação
- stack
- regras do produto
- critérios de aceite
- proibições
- estrutura de domínio

**Database Blueprint**
- arquitetura de dados oficial
- relações
- persistência
- segurança
- regras históricas
- Intelligence derivada

**Supabase Schema**
- referência SQL oficial
- deve ser comparado com o schema existente
- não aplicar destrutivamente sem diff e plano de migração

**V8 Consolidated Master Prototype**
- referência visual + funcional mais atual
- consolida o melhor das versões anteriores
- não deve ser copiado literalmente como arquitetura
- use-o para convergir UX, composição, funcionalidades e comportamento

## Regra principal: NÃO REBUILD

Antes de modificar qualquer coisa:

1. inspecione o repositório atual
2. inventarie o que já funciona
3. compare implementação atual × V8 × Blueprint × SQL
4. classifique cada item como PRESERVAR, ADAPTAR, ADICIONAR ou REMOVER SOMENTE SE OBSOLETO
5. produza um plano de convergência incremental
6. só então implemente

Não:
- recriar páginas já corretas sem necessidade
- substituir services/actions funcionais apenas por preferência
- zerar o schema
- apagar migration existente
- remover dados
- renomear rotas de forma destrutiva
- trocar domínio funcional por código do HTML
- tratar o HTML V8 como código de produção

## Hierarquia de autoridade

Quando houver conflito:

1. Master Prompt
2. Database Blueprint
3. Supabase Schema
4. V8 como referência funcional/visual
5. implementação atual, quando não conflitar

Se houver incompatibilidade real entre SQL oficial e banco atual:
- documente
- proponha migration incremental
- faça backfill quando necessário
- evite DROP
- preserve dados reais

## Correção das inferências do plano anterior

No plano anterior foram inferidos recursos como:

- hábitos diários
- agenda própria
- social login
- /inicio
- /dieta
- perfil como nova área principal
- Orbitron/Sora como fonte obrigatória

Esses itens NÃO devem ser tratados automaticamente como requisitos oficiais apenas por terem aparecido em material intermediário ou inferência visual.

Somente implementar se estiverem confirmados nos arquivos oficiais ou se forem posteriormente aprovados pelo usuário.

### Não adicionar por inferência

- tabela daily_habits
- schedule_events
- OAuth Google/Apple
- nova IA de navegação incompatível com a existente
- novas rotas apenas por naming
- métricas novas
- features SaaS multiusuário

## O que já existe e deve ser valorizado

A implementação atual já possui uma base importante:
- Next.js / TypeScript
- Supabase
- Auth
- RLS
- Storage
- services
- server actions
- domínio de aderência/progressão/scores
- dashboard
- Hoje
- Semana
- Treinos
- Nutrição
- Cardio
- Sono
- Progresso
- Fotos
- Relatórios
- Configurações
- Quick Entry
- autosave
- PWA
- demo/mock fallback

A reforma deve aproveitar isso.

## Objetivo da V8

A V8 passa a ser a referência de experiência mais completa para consolidar:

- dashboard operacional
- registro diário central
- peso rápido
- Day On / Day Off
- treino ao vivo
- carga / reps / RIR
- warm-up separado de work sets
- timer de treino
- descanso
- progressão
- PRs
- histórico de exercício
- Semana detalhada
- Nutrição
- Cardio
- Sono
- Progresso corporal
- Medidas
- Fotos
- Comparador
- Check-in
- Timeline
- Relatórios
- Intelligence
- Readiness
- Trend Engine
- Anomaly Detection
- Correlations
- Performance Intelligence
- Action Engine

## Auth / Mock / produção

O modo demo/mock atual pode continuar temporariamente para desenvolvimento.

Porém:
- não deve mascarar falhas em produção
- dados reais devem usar Supabase
- Auth deve voltar a ser obrigatório quando a infraestrutura de produção estiver validada
- NEXT_PUBLIC_AUTH_DISABLED é ferramenta temporária de desenvolvimento, não estado final

Antes do go-live:
- validar env vars
- validar login
- validar RLS
- validar Storage
- validar persistência cross-device

## Estratégia de schema

Não substituir 001_init.sql cegamente pelo novo SQL.

Primeiro gerar um diff:

schema atual
VS
ryvon_supabase_schema_v1.sql

Depois criar migrations incrementais, por exemplo:

002_v8_core_alignment.sql
003_v8_body_progress.sql
004_v8_intelligence_support.sql

Use apenas as migrations realmente necessárias.

## Primeiro trabalho solicitado ao Cursor

Agora que os quatro arquivos oficiais estão disponíveis:

### PASSO 1 — Sprint 0 / Convergence Audit

Não implemente ainda uma reforma ampla.

Entregue primeiro:

#### A. Inventário atual
- rotas
- componentes
- services
- actions
- domain
- types
- hooks
- migrations
- storage
- auth
- PWA

#### B. Diff funcional
Para cada módulo da V8:
- já existe
- existe parcialmente
- não existe
- existe mas precisa de redesign

#### C. Diff de banco
Comparar:
- 001_init.sql
- ryvon_supabase_schema_v1.sql

Classificar:
- tabelas equivalentes
- nomes divergentes
- campos faltantes
- tipos divergentes
- RLS
- constraints
- indexes
- storage
- dados que exigem backfill

#### D. Plano de migração
Sem perda de dados.

#### E. Plano visual
Mapear:
- shell
- tokens
- cards
- dashboard
- mobile nav
- telas
- estados vazios
- loading
- feedback

#### F. Plano de convergência por sprint
Baseado no estado REAL encontrado no repo, não em suposições.

## Critério para encerrar Sprint 0

A Sprint 0 termina quando tivermos um documento dizendo precisamente:

O QUE JÁ TEMOS
+
O QUE A V8 EXIGE
+
O QUE SERÁ PRESERVADO
+
O QUE SERÁ ADAPTADO
+
O QUE SERÁ ADICIONADO
+
QUAIS MIGRATIONS SERÃO NECESSÁRIAS
+
QUAL A ORDEM SEGURA DE IMPLEMENTAÇÃO

Depois disso, pare e aguarde aprovação antes de iniciar a reforma.

## Resultado esperado

A RYVON final deve parecer uma evolução natural da aplicação atual, mas atingir a experiência, completude e inteligência definidas na V8.

Preservar o que já está sólido. Reformar completamente o que precisa evoluir. Não reconstruir por reconstruir.
