
# Guia Completo: Vercel Skills.sh – Ecossistema Aberto de Skills para Agentes de IA (2026)

## 1. O que é Skills.sh?
Skills.sh é o diretório oficial e ecossistema aberto da Vercel para **skills** (capacidades reutilizáveis) de agentes de IA.  
Lançado em janeiro de 2026, é considerado o "npm para agentes de IA".  

- Skills = pacotes reutilizáveis com conhecimento procedural (prompts estruturados, regras, best practices, exemplos, ferramentas).  
- São instalados via CLI e usados automaticamente por agentes como Claude Code, Cursor, Windsurf, Codex, OpenCode, GitHub Copilot etc. (suporte a +35 agentes).  
- Benefício principal: melhora drasticamente a qualidade de código, UI/UX, arquitetura e outputs sem precisar de prompts gigantes.  
- Site oficial: [https://skills.sh](https://skills.sh) (diretório + leaderboard de popularidade/instalações).

## 2. Por que usar Skills? (Diferença prática)
Com uma skill certa ativada:  
- UI/Design → layouts modernos, paleta harmoniosa, ícones profissionais, acessibilidade, responsividade (ex: skill frontend-design deixa outputs "ridiculamente" melhores).  
- React/Next.js → código limpo, memoização correta, Server Components, otimização de bundle, padrões Vercel.  
- Outros: SEO audit, copywriting, TDD, debugging sistemático, geração de PDF/DOCX/XLSX, etc.  
Exemplo real (do vídeo): prompt simples de landing page → sem skill = UI genérica e feia; com skill frontend-design = design profissional e polido.

## 3. Como Instalar Skills (Passo a Passo)
1. Acesse https://skills.sh e procure a skill desejada (busca por categoria, popularidade ou nome).  
2. Copie o comando de instalação exibido (sempre começa com `npx skills ...`).  

Comandos comuns (2026):  
```bash
# Instalar skill específica (recomendado)
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices

# Instalar pacote completo (múltiplas skills)
npx skills add vercel-labs/agent-skills

# Busca interativa (descobrir skills)
npx skills find

# Atualizar skills locais
npx skills update
```

- Durante instalação:  
  - Escolha **projeto local** (`.skills/` ou pastas específicas do agente) ou **global** (`~/.skills/`).  
  - Selecione agentes-alvo (ex: claude-code, cursor, windsurf).  
  - Prefira **symlink** (leve e atualiza automaticamente).  

Após instalar → skills ficam em pastas como `.cursor/skills/`, `.claude/skills/`, etc.

## 4. Skills Mais Impactantes e Populares (2026)
- vercel-labs/agent-skills  
  - vercel-react-best-practices (123K+ installs)  
  - web-design-guidelines / frontend-design  
- anthropics/skills  
  - frontend-design (63K+)  
  - pdf / docx / xlsx  
- shadcn-ui / tailwind-related  
- remotion-dev/skills → remotion-best-practices  
- Outras top: seo-audit, copywriting, systematic-debugging, test-driven-development.

## 5. Como Ativar e Usar Skills (para LLMs/Agentes)
- Agentes compatíveis detectam e ativam skills automaticamente quando relevante.  
- Ativação explícita (melhor prática em prompts):  
  ```text
  Use a skill @vercel/skills/frontend-design para criar esta UI.
  Aplique vercel-react-best-practices neste componente React.
  ```
- Regras de ouro para LLMs:  
  1. Procure primeiro em `.skills/` do projeto → depois global.  
  2. Aplique **exatamente** as diretrizes, padrões e restrições da skill.  
  3. Priorize: profissional, limpo, moderno, acessível, responsivo.  
  4. Mantenha consistência (cores, spacing, typography, patterns).  
  5. Cite brevemente: “Usando skill frontend-design da Vercel para melhorar UX/UI.”

## 6. Estrutura Típica de uma Skill
- Arquivo principal: `SKILL.md` ou similar (Markdown com seções claras).  
- Conteúdo comum:  
  - Nome, descrição, tags.  
  - Regras obrigatórias / proibidas.  
  - Exemplos de prompts/respostas ideais.  
  - Padrões de código (React hooks, Tailwind classes, etc.).  
  - Ferramentas/invocação (se aplicável).  
- Algumas incluem assets (ícones, templates).

## 7. Dicas Avançadas e Melhores Práticas (2026)
- Combine skills: ex. frontend-design + react-best-practices + shadcn-ui.  
- Para projetos Next.js → use `npx @next/codemod@canary agents-md` (alternativa complementar: AGENTS.md persistente).  
- Skills vs AGENTS.md/CLAUDE.md: skills são on-demand (carregam só quando necessárias); AGENTS.md é contexto sempre presente.  
- Crie sua própria skill: siga o padrão open (https://agentskills.io/), publique no GitHub e envie para skills.sh.  
- Suporte oficial: 35+ agentes (Claude Code, Cursor, Windsurf, Codex, etc.).

## 8. Recursos Oficiais
- Site: https://skills.sh  
- Docs: https://skills.sh/docs  
- CLI GitHub: https://github.com/vercel-labs/skills  
- Anúncio Vercel: https://vercel.com/changelog/introducing-skills-the-open-agent-skills-ecosystem  
- Leaderboard e busca: https://skills.sh  

Última atualização deste guia: fevereiro 2026  
Use sempre que gerar código/UI/arquitetura — o ganho de qualidade é enorme.
```

Salve como `vercel-skills-guia-completo.md` e use como skill custom ou referência em seus agentes/LLMs. Se precisar de versão mais curta ou focada em algo específico (ex: só React), avise!