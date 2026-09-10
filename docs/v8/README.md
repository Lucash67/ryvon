# RYVON V8 — documentação oficial

Pasta de referência para a reforma/convergência V8.

## Leitura (ordem)

1. `RYVON_V8_REFORM_HANDOFF.md` — regras e estratégia (não rebuild)
2. `RYVON_CURSOR_MASTER_IMPLEMENTATION_PROMPT_v1.md` — contrato de implementação
3. `ryvon_database_blueprint_v1.md` — arquitetura de dados
4. `ryvon_supabase_schema_v1.sql` — SQL oficial
5. `ryvon_v8_consolidated_master_prototype.html` — referência visual/funcional

## Status

| Arquivo | Status |
|---------|--------|
| `RYVON_V8_REFORM_HANDOFF.md` | ✅ |
| `RYVON_CURSOR_MASTER_IMPLEMENTATION_PROMPT_v1.md` | ✅ |
| `ryvon_database_blueprint_v1.md` | ✅ |
| `ryvon_supabase_schema_v1.sql` | ✅ |
| `ryvon_v8_consolidated_master_prototype.html` | ✅ |

## Referência auxiliar (não oficial)

- `reference/ryvon_app_demo_v3.html` — protótipo intermediário; não substitui o V8 Consolidated.

## Schema atual do app

Migration existente: `supabase/migrations/001_init.sql`  
Diff oficial: comparar com `ryvon_supabase_schema_v1.sql` antes de qualquer migration destrutiva.
