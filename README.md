# SGN — Sistema de Gestão Normativa

## Visão
Plataforma de compliance automatizada: coleta, análise de conformidade e relatórios executivos.

## Como rodar
1) **Pré-requisitos:** Node 20, Supabase, N8N
2) **Desenvolvimento:**
```bash
# Frontend
cd /home/brunoadsba/sgn/frontend
npm install
npm run dev

# N8N (em terminal separado)
cd /home/brunoadsba/sgn
n8n start
```
3) **Acesso:**
   - Frontend: http://localhost:3001
   - N8N: http://localhost:5678
4) **Variáveis de ambiente:** veja `docs/arquitetura.md` e `docs/environment.md`

## Teste rápido (API)
```bash
# Estatísticas das normas
curl -s "http://localhost:3001/api/normas/stats" | jq .

# Lista de normas (primeiras 5)
curl -s "http://localhost:3001/api/normas?limit=5" | jq .

# Detalhes de uma norma específica
curl -s "http://localhost:3001/api/normas/56" | jq .

# Dashboard de conformidade (Construtora BR)
curl -s "http://localhost:3001/api/conformidade/dashboard/9feb8d42-d560-4465-95c6-ad31e6aeb387" | jq .

# Lista de empresas
curl -s "http://localhost:3001/api/empresas" | jq .
```

## Estrutura
- `frontend/` (Next.js 15 + TypeScript)
  - `src/app/page.tsx` (Dashboard principal)
  - `src/app/normas/` (Páginas de normas)
  - `src/app/empresas/` (Páginas de empresas e conformidade)
  - `src/app/api/normas/` (APIs de normas)
  - `src/app/api/conformidade/` (APIs de conformidade)
  - `src/app/api/empresas/` (APIs de empresas)
  - `src/components/conformidade/` (Componentes de conformidade)
    - `StatusGeral.tsx` (Status consolidado com layout horizontal)
    - `PontosAtencao.tsx` (Distribuição por severidade)
    - `EstatisticasEssenciais.tsx` (Métricas de processamento)
    - `AlertasList.tsx` (Sistema de alertas)
  - `src/components/ui/` (Componentes base)
    - `interactive-card.tsx` (Cards clicáveis com hover)
  - `src/components/dynamic/` (Componentes com lazy loading)
- `docs/` (arquitetura, roadmap, runbooks, API)
- `.env-n8n` (Configuração do N8N)
- `status-implementacao.md` (fonte única de status)

## Status Atual
- **MVP**: 100% concluído ✅
- **Sistema**: 100% funcional e operacional ✅
- **Dados**: 38 normas (36 ativas, 2 revogadas) ✅
- **Interface**: Otimizada e sem problemas ✅
- **Dashboard de Conformidade**: 100% implementado ✅
- **Empresas**: 3 empresas profissionais cadastradas ✅
- **Conformidade corporativa**: 95% (multi-tenant, análise, relatórios, UI executiva)
- **UI Executiva**: Implementada (KPIs, gaps, jobs, componentes React)
- Roadmap: `docs/roadmap.md` (consolidado)
- Status detalhado: `status-implementacao.md`

### 🔧 Correções Recentes (15/09/2025)
- ✅ **Dashboard de Conformidade** implementado com dados reais
- ✅ **Empresas profissionais** criadas (Construtora BR, Tech BR, Indústrias BR)
- ✅ **Terminologia SST** adequada para área de Segurança do Trabalho
- ✅ **Correções React** (Suspense e Button asChild)
- ✅ **Cache Next.js** otimizado para dados em tempo real
- ✅ **Mapeamento de dados** API → Frontend corrigido
- ✅ **Interface executiva** com KPIs e métricas
- ✅ **Dados profissionais** com CNPJs e informações corporativas

## Configuração do N8N
O sistema usa N8N conectado ao Supabase (PostgreSQL). Configuração em `.env-n8n`:

```bash
N8N_TIMEZONE=America/Sao_Paulo
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.kqdilsmgjlgmqcoubpel.supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=sua_senha_aqui
```

## Segurança
Consulte `docs/environment.md` e políticas RLS em `docs/arquitetura.md`.

## Dashboard de Conformidade

O sistema agora inclui um **Dashboard de Conformidade** completo para empresas:

### 🎯 **Funcionalidades:**
- **Resumo Executivo** com Índice de Conformidade
- **KPIs Detalhados** (Avaliações, Lacunas, Documentos)
- **Oportunidades de Melhoria** identificadas
- **Avaliações Recentes** com status em tempo real

### 🏢 **Empresas Cadastradas:**
- **Construtora BR** (Construção Civil) - ID: `9feb8d42-d560-4465-95c6-ad31e6aeb387`
- **Tech BR** (Tecnologia)
- **Indústrias BR** (Indústria)

### 📊 **Terminologia SST:**
- **Conforme** / **Não Conforme** / **Oportunidade de Melhoria**
- **Índice de Conformidade** (em vez de "Score")
- **Avaliações** (em vez de "Jobs")
- **Lacunas** (em vez de "Gaps")

### 🌐 **Acesso:**
- **Lista de Empresas**: `http://localhost:3001/empresas`
- **Dashboard Construtora BR**: `http://localhost:3001/empresas/9feb8d42-d560-4465-95c6-ad31e6aeb387/conformidade`

## Solução de Problemas Comuns

### Erro: `ECONNREFUSED` durante o Build

Se você encontrar um erro `ECONNREFUSED` (Connection Refused) durante o processo de build (ex: `npm run build` ou `yarn build`), isso geralmente significa que o seu aplicativo frontend (Next.js, por exemplo) está tentando se conectar a um servidor de API local que não está em execução.

**Causa:**

Alguns frameworks de frontend, como o Next.js, podem realizar requisições de dados para APIs durante o processo de build estático (Server-Side Rendering - SSR ou Static Site Generation - SSG). Se a API que ele tenta acessar não estiver disponível (ou seja, o servidor da API não está rodando), a conexão será recusada, resultando no erro `ECONNREFUSED`.

**Solução:**

Para resolver este problema, certifique-se de que o servidor de desenvolvimento da API esteja em execução **antes** de iniciar o processo de build do frontend.

1. **Inicie o servidor da API:** Navegue até o diretório do seu projeto de backend (se for separado) e inicie-o. Por exemplo:
   ```bash
   cd ../backend # Ou o caminho para o seu backend
   npm run dev   # Ou o comando para iniciar sua API
   ```
2. **Inicie o build do Frontend:** Após confirmar que a API está rodando, inicie o build do seu projeto frontend:
   ```bash
   npm run build # Ou yarn build
   ```

**Observação:** Este erro é comum em ambientes de desenvolvimento local. Em ambientes de CI/CD ou produção, a API geralmente já estará disponível e acessível, então este problema não deve ocorrer.

### Erro: `React.Children.only expected to receive a single React element child`

**Causa:** Uso incorreto do componente `Suspense` ou `Button` com `asChild` dentro de `Link`.

**Solução:**
```tsx
// ❌ Incorreto
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>

<Link href="/path">
  <Button asChild>
    <span>Texto</span>
  </Button>
</Link>

// ✅ Correto
<Link href="/path">
  <Button>Texto</Button>
</Link>
```

### Erro: `Cannot read properties of undefined (reading 'totalJobs')`

**Causa:** Componente tentando acessar propriedades de dados `undefined` ou `null`.

**Solução:**
```tsx
// ❌ Incorreto
<Component data={data.kpis} />

// ✅ Correto
{data && data.kpis && <Component data={data.kpis} />}
```

### Erro: `Invariant revalidate: 0 can not be passed to unstable_cache()`

**Causa:** `unstable_cache` não aceita `revalidate: 0`.

**Solução:**
```tsx
// ❌ Incorreto
const getData = unstable_cache(fn, ['key'], { revalidate: 0 })

// ✅ Correto
const getData = unstable_cache(fn, ['key'], { revalidate: false })
```

### Erro: `column does not exist` ou `violates check constraint`

**Causa:** Estrutura de dados não corresponde ao schema do banco.

**Solução:**
1. Verificar schema da tabela no Supabase
2. Ajustar queries para usar colunas corretas
3. Validar valores contra constraints CHECK

### Erro: Cache do Next.js não atualiza dados

**Causa:** `unstable_cache` mantém dados antigos em cache.

**Solução:**
```tsx
// Remover cache temporariamente
async function getData() {
  // Busca direta sem cache
  return await supabase.from('table').select('*')
}
```

### Erro: `duplicate key value violates unique constraint`

**Causa:** Tentativa de inserir registro com chave única duplicada.

**Solução:**
```sql
-- Verificar registros existentes
SELECT * FROM table WHERE unique_field = 'value';

-- Usar UPSERT ou verificar antes de inserir
INSERT INTO table (...) VALUES (...) ON CONFLICT (unique_field) DO UPDATE SET ...
```