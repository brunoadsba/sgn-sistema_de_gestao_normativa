{
  "mcpServers": {
    "Browserbase": {
      "command": "npx @browserbasehq/mcp",
      "env": {
        "BROWSERBASE_API_KEY": "",
        "BROWSERBASE_PROJECT_ID": ""
      }
    },
    "DuckDB": {
      "command": "uvx mcp-server-motherduck --db-path :memory:",
      "env": {
        "motherduck_token": ""
      }
    },
    "Figma": {
      "url": "http://127.0.0.1:3845/sse"
    },
    "GitHub": {
      "command": "docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "seu_github_token_aqui"
      }
    },
    "Notion": {
      "url": "https://mcp.notion.com/mcp"
    },
    "Playwright": {
      "command": "npx @playwright/mcp@latest",
      "env": {}
    },
    "Snyk": {
      "command": "snyk mcp -t stdio --experimental",
      "env": {}
    },
    "Supabase": {
      "command": "wsl",
      "args": [
        "npx",
        "-y",
        "@supabase/mcp-server-supabase",
        "--read-only",
        "--project-ref=kqdilsmgjlgmqcoubpel"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZGlsc21namxnbXFjb3VicGVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ5MTQ4NCwiZXhwIjoyMDcyMDY3NDg0fQ.BBjbo0OwTePUG96Zp688_Tp12OmEpA6dsKV-Ii0THjI"
      }
    }
  }
}