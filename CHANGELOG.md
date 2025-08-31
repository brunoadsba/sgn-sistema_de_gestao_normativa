# Changelog

Todas as mudanças importantes do projeto SGN serão documentadas neste arquivo.

## [MVP] - 2025-08-31

### Adicionado
- Sistema de coleta automática de 38 Normas Regulamentadoras
- Dashboard com estatísticas em tempo real
- APIs profissionais (normas, search, export, empresas)
- Interface responsiva com filtros avançados
- Sistema multi-tenant para empresas
- Upload e gestão de documentos corporativos
- Análise básica de conformidade

### Técnico
- Frontend: Next.js 15 + TypeScript + Tailwind + Shadcn/ui
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Automação: N8N para coleta de normas
- Deploy: Vercel

## [Documentação] - 2025-08-31

### Adicionado
- README.md consolidado
- Documentação de arquitetura
- Políticas de segurança (SECURITY.md)
- Guia de contribuição (CONTRIBUTING.md)
- Roadmap unificado
- Script de atualização automática de datas

### Reorganizado
- Estrutura docs/ com runbooks/
- Nomenclatura padronizada (.md minúsculo)
- Arquivos obsoletos movidos para /obsoleto/
