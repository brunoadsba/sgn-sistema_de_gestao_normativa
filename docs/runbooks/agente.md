# SGN - INSTRUÇÕES PARA AGENTE AUTÔNOMO

## VERSÃO DO AGENTE: 1.1
**ÚLTIMA ATUALIZAÇÃO:** 31 de agosto de 2025  
**COMPATÍVEL COM:** SGN v2.0 (pós-MVP)  
**STATUS PROJETO:** MVP 100% completo, branch 'melhorias' consolidada

---

## CONTEXTO DO PROJETO

### TECNOLOGIAS UTILIZADAS
- **Frontend:** Next.js 15.5.2, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth), API Routes
- **Automação:** N8N (coleta de normas)
- **Deploy:** Vercel, Git

### ESTRUTURA ATUAL CONFIRMADA
- **Branch atual:** `melhorias` (melhorias técnicas consolidadas)
- **Supabase client:** Instância única em `/lib/supabase.ts`
- **Padrão de APIs:** `Response.json()` com formato `{ success, data, pagination }`
- **Banco existente:** Tabelas `normas`, `versoes`, `mudancas` com coluna `nr_num`

### OBJETIVO ESTRATÉGICO
Transformar MVP informativo em **plataforma de conformidade corporativa automatizada**:
- **ANTES:** Sistema de consulta → R$ 200-500/mês
- **DEPOIS:** Consultoria automatizada → R$ 2.000-10.000/mês
- **MULTIPLICADOR:** 10x-20x no valor percebido

---

## PROTOCOLOS OBRIGATÓRIOS DE EXECUÇÃO

### ⚠️ ANTES DE QUALQUER IMPLEMENTAÇÃO:
1. **Verificar branch atual:** Está em `melhorias` (consolidada)
2. **Criar nova branch:** `git checkout -b feature/conformidade-corporativa`
3. **Verificar ambiente:** `npm run dev` no diretório frontend
4. **Criar estrutura necessária:** `mkdir -p frontend/src/types`
5. **Validar Supabase:** Verificar tabelas existentes

### 🔧 DURANTE IMPLEMENTAÇÃO:
1. **TypeScript obrigatório:** Todos os arquivos devem ser .ts/.tsx
2. **Tipagem completa:** Definir interfaces para todas as estruturas
3. **Padrões do projeto:** Usar Shadcn/ui components e Tailwind CSS
4. **Estrutura de pastas:** Seguir convenção Next.js 15 (app directory)
5. **Tratamento de erros:** Implementar try/catch com padrão existente
6. **Responsividade:** Testar em mobile e desktop

### ✅ APÓS IMPLEMENTAÇÃO:
1. **Testar funcionalidade completa** no navegador
2. **Verificar console** para erros JavaScript/TypeScript
3. **Commit descritivo:** `git commit -m "feat: [descrição clara]"`
4. **Atualizar documentação** se necessário
5. **Reportar conclusão** com detalhes do que foi implementado

---

## FASE 6: ANÁLISE DE CONFORMIDADE CORPORATIVA
**PRIORIDADE MÁXIMA - 8 semanas**

### PASSO 1: ARQUITETURA MULTI-TENANT

#### 1.1 CRIAR ESTRUTURA DE TIPOS
**1º Comando:** Criar diretório types
```bash
mkdir -p frontend/src/types
```

**Arquivo:** `frontend/src/types/conformidade.ts`

```typescript
export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  setor: string;
  porte: 'pequeno' | 'medio' | 'grande';
  configuracoes: Record<string, any>;
  ativo: boolean;
  created_at: string;
}

export interface DocumentoEmpresa {
  id: string;
  empresa_id: string;
  nome_arquivo: string;
  tipo_documento: 'manual' | 'procedimento' | 'treinamento' | 'politica';
  conteudo_extraido: string;
  metadados: Record<string, any>;
  url_storage: string;
  versao: number;
  created_at: string;
}

export interface AnaliseConformidade {
  id: string;
  empresa_id: string;
  norma_id: string;
  documento_id: string;
  status_conformidade: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';
  lacunas_identificadas: string[];
  acoes_recomendadas: string[];
  score_conformidade: number;
  observacoes: string;
  created_at: string;
}

// Tipos para respostas da API (seguindo padrão existente)
export interface ApiResponseEmpresas {
  success: boolean;
  data: Empresa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponseDocumentos {
  success: boolean;
  data: DocumentoEmpresa[];
  total: number;
}
```

#### 1.2 CRIAR TABELAS NO SUPABASE
**Ação:** Executar SQL no Supabase Dashboard → SQL Editor

```sql
-- Verificar se tabela normas existe (deve existir)
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'normas'
);

-- Criar tabela empresas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  setor TEXT,
  porte TEXT CHECK (porte IN ('pequeno', 'medio', 'grande')),
  configuracoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela documentos_empresa
CREATE TABLE IF NOT EXISTS documentos_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_documento TEXT CHECK (tipo_documento IN ('manual', 'procedimento', 'treinamento', 'politica')),
  conteudo_extraido TEXT,
  metadados JSONB DEFAULT '{}',
  url_storage TEXT NOT NULL,
  versao INTEGER DEFAULT 1,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', nome_arquivo || ' ' || COALESCE(conteudo_extraido, ''))) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela analises_conformidade
CREATE TABLE IF NOT EXISTS analises_conformidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  norma_id UUID REFERENCES normas(id),
  documento_id UUID REFERENCES documentos_empresa(id),
  status_conformidade TEXT CHECK (status_conformidade IN ('conforme', 'nao_conforme', 'parcial', 'nao_aplicavel')),
  lacunas_identificadas TEXT[],
  acoes_recomendadas TEXT[],
  score_conformidade INTEGER CHECK (score_conformidade >= 0 AND score_conformidade <= 100),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_empresa_search ON documentos_empresa USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_analises_empresa_norma ON analises_conformidade(empresa_id, norma_id);
CREATE INDEX IF NOT EXISTS idx_analises_score ON analises_conformidade(score_conformidade DESC);

-- Habilitar Row Level Security
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_conformidade ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto)
DROP POLICY IF EXISTS "Permitir tudo empresas" ON empresas;
DROP POLICY IF EXISTS "Permitir tudo documentos" ON documentos_empresa;
DROP POLICY IF EXISTS "Permitir tudo analises" ON analises_conformidade;

CREATE POLICY "Permitir tudo empresas" ON empresas FOR ALL USING (true);
CREATE POLICY "Permitir tudo documentos" ON documentos_empresa FOR ALL USING (true);
CREATE POLICY "Permitir tudo analises" ON analises_conformidade FOR ALL USING (true);

-- Verificar criação das tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('empresas', 'documentos_empresa', 'analises_conformidade');
```

#### 1.3 CRIAR API DE EMPRESAS
**Arquivo:** `frontend/src/app/api/empresas/route.ts`

```typescript
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("empresas")
      .select("*", { count: "exact" })
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("nome", `%${search}%`);
    }

    const { data: empresas, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: empresas || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, cnpj, setor, porte } = body;

    if (!nome) {
      return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("empresas")
      .insert([{ nome, cnpj, setor, porte }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: "Erro ao criar empresa" }, { status: 500 });
    }

    return Response.json({
      success: true,
      data
    }, { status: 201 });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
```

### PASSO 2: SISTEMA DE GESTÃO DOCUMENTAL

#### 2.1 CONFIGURAR SUPABASE STORAGE
**Ação:** Criar bucket no Supabase Dashboard → Storage

1. Acesse Supabase Dashboard → Storage
2. Criar novo bucket: `documentos-empresa`
3. Configurar como público: `false` (privado)
4. Configurar políticas de acesso

#### 2.2 CRIAR API DE UPLOAD DE DOCUMENTOS
**Arquivo:** `frontend/src/app/api/empresas/[id]/documentos/route.ts`

```typescript
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipoDocumento = formData.get("tipo_documento") as string;

    if (!file) {
      return Response.json({ error: "Arquivo é obrigatório" }, { status: 400 });
    }

    if (!tipoDocumento) {
      return Response.json({ error: "Tipo de documento é obrigatório" }, { status: 400 });
    }

    // Upload para Supabase Storage
    const fileName = `${empresaId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documentos-empresa")
      .upload(fileName, file);

    if (uploadError) {
      return Response.json({ error: "Erro no upload do arquivo" }, { status: 500 });
    }

    // Salvar metadados no banco
    const { data, error } = await supabase
      .from("documentos_empresa")
      .insert([{
        empresa_id: empresaId,
        nome_arquivo: file.name,
        tipo_documento: tipoDocumento,
        url_storage: uploadData.path,
        metadados: {
          tamanho: file.size,
          tipo_mime: file.type,
          upload_timestamp: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: "Erro ao salvar documento" }, { status: 500 });
    }

    return Response.json({
      success: true,
      data
    }, { status: 201 });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    const { data: documentos, error } = await supabase
      .from("documentos_empresa")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: documentos || [],
      total: documentos?.length || 0
    });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
```

### PASSO 3: INTERFACE DE GESTÃO DE EMPRESAS

#### 3.1 CRIAR PÁGINA DE LISTAGEM DE EMPRESAS
**Arquivo:** `frontend/src/app/empresas/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, SearchIcon, BuildingIcon } from 'lucide-react'
import Link from 'next/link'
import type { Empresa, ApiResponseEmpresas } from '@/types/conformidade'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchEmpresas()
  }, [search])

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      
      const response = await fetch(`/api/empresas?${params}`)
      const result: ApiResponseEmpresas = await response.json()
      
      if (response.ok && result.success) {
        setEmpresas(result.data)
        setTotal(result.pagination.total)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPorteVariant = (porte: string) => {
    switch (porte) {
      case 'grande': return 'default'
      case 'medio': return 'secondary'
      case 'pequeno': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie empresas clientes e suas análises de conformidade
          </p>
        </div>
        <Button asChild>
          <Link href="/empresas/nova">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Empresa
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          empresas.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5" />
                  {empresa.nome}
                </CardTitle>
                <Badge variant={getPorteVariant(empresa.porte)}>
                  {empresa.porte}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>CNPJ: {empresa.cnpj || 'Não informado'}</p>
                  <p>Setor: {empresa.setor || 'Não definido'}</p>
                  <p>Cadastro: {new Date(empresa.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/empresas/${empresa.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/empresas/${empresa.id}/conformidade`}>
                      Conformidade
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!loading && empresas.length === 0 && (
        <div className="text-center py-12">
          <BuildingIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {search ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando sua primeira empresa'}
          </p>
          <Button asChild>
            <Link href="/empresas/nova">Cadastrar Empresa</Link>
          </Button>
        </div>
      )}

      {total > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Total: {total} empresa{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
```

---

## CHECKPOINTS DE VALIDAÇÃO

### ✅ CHECKPOINT PASSO 1:
- [ ] Diretório `types` criado
- [ ] Tipos TypeScript criados sem erros
- [ ] Tabelas criadas no Supabase (verificar no Dashboard)
- [ ] API `/api/empresas` funcionando
- [ ] GET e POST testados via curl/Thunder

### ✅ CHECKPOINT PASSO 2:
- [ ] Bucket `documentos-empresa` criado no Supabase
- [ ] Upload de arquivos funcionando
- [ ] API de documentos operacional
- [ ] Metadados salvos corretamente

### ✅ CHECKPOINT PASSO 3:
- [ ] Página `/empresas` renderizando
- [ ] Busca funcionando
- [ ] Cards de empresas exibindo dados
- [ ] Navegação entre páginas operacional
- [ ] Types importados corretamente

---

## COMANDOS DE EXECUÇÃO

### INICIAR IMPLEMENTAÇÃO:
```bash
# A partir da branch melhorias (atual)
git checkout -b feature/conformidade-corporativa
mkdir -p frontend/src/types
cd frontend && npm run dev
```

### TESTAR IMPLEMENTAÇÃO:
```bash
# Testar APIs
curl http://localhost:3001/api/empresas
curl -X POST http://localhost:3001/api/empresas -H "Content-Type: application/json" -d '{"nome":"Empresa Teste","cnpj":"12345678000100","setor":"Industrial","porte":"medio"}'

# Verificar TypeScript
cd frontend && npx tsc --noEmit
```

### FINALIZAR PASSO:
```bash
git add .
git commit -m "feat: implementar sistema multi-tenant - [passo específico]"
git push origin feature/conformidade-corporativa
```

---

## EM CASO DE ERRO

### PROCEDIMENTO DE EMERGÊNCIA:
1. **PARAR execução imediatamente**
2. **REPORTAR erro específico** com arquivo e linha
3. **SUGERIR correção** ou rollback
4. **AGUARDAR confirmação** antes de continuar
5. **DOCUMENTAR solução** para referência futura

### ROLLBACK RÁPIDO:
```bash
git reset --hard HEAD~1  # Desfazer último commit
git checkout melhorias   # Voltar para branch principal
```

---

## PRÓXIMOS PASSOS APÓS FASE 6

### FASE 1: BUSCA GLOBAL (2 semanas)
### FASE 2: RELATÓRIOS (3 semanas)
### FASE 3: NOTIFICAÇÕES (2 semanas)
### FASE 4: IA AVANÇADA (4 semanas)
### FASE 5: SISTEMA COMPLETO (3 semanas)

---

## RESULTADO ESPERADO

Ao final da Fase 6, o SGN terá:
- ✅ Sistema multi-tenant funcional
- ✅ Upload e gestão de documentos
- ✅ Interface de gestão de empresas
- ✅ Base para análise de conformidade
- ✅ Arquitetura escalável implementada
- ✅ Compatibilidade total com projeto existente

**VALOR AGREGADO:** Transformação de MVP em plataforma corporativa de alto valor.

---

## PADRÕES DO PROJETO APLICADOS

### ✅ CORREÇÕES IMPLEMENTADAS:
1. **Import Supabase:** `import { supabase } from "@/lib/supabase"`
2. **Padrão de resposta:** `Response.json({ success, data, pagination })`
3. **Tratamento de erros:** Padrão `try/catch` sem console.error
4. **Estrutura validada:** Compatível com Next.js 15.5.2
5. **Tipagem completa:** Types exportados de `/types/conformidade.ts`
6. **Branch correta:** A partir de `melhorias` (consolidada)
7. **Comandos atualizados:** Refletem estado atual do projeto
8. **Supabase Storage:** Configuração explícita incluída
9. **Validações SQL:** Verificações de existência de tabelas
10. **Consistência total:** Alinhado com padrões existentes

**STATUS:** Agente.MD corrigido e pronto para implementação segura.