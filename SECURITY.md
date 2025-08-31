# Segurança e Privacidade

## Princípios
- Isolamento por tenant via RLS.
- Mínimo privilégio; segredos fora do repositório.
- Acesso a documentos empresariais somente por contexto de empresa.

## Dados Sensíveis
- Documentos empresariais (Storage) — acesso privado.
- Credenciais Supabase (chaves e URLs) — somente via `.env.local`.

## Reporte de Vulnerabilidades
- Canal: definir e-mail/canal oficial.
- SLA de resposta: 5 dias úteis.
- Não abrir issues públicas com dados sensíveis.
