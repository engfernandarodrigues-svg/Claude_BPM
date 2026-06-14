═══════════════════════════════════════════════
  AGENTE BPM — AgentLabs / SYDLE ONE
═══════════════════════════════════════════════

ARQUIVOS
────────
  agente_bpm.html   → interface do agente (abrir no browser)
  server.js         → proxy local para a API Anthropic
  README.txt        → este arquivo

PRÉ-REQUISITOS
──────────────
  • Node.js instalado (https://nodejs.org)
  • Chave de API Anthropic (https://console.anthropic.com/settings/keys)

COMO USAR
─────────

  1. Abra um terminal na pasta onde estão os arquivos

  2. Inicie o servidor proxy:
       node server.js sk-ant-api03-SUA_CHAVE_AQUI

     Você verá:
       ✅  Proxy rodando em http://localhost:3131

  3. Abra o agente_bpm.html no browser
     (duplo clique ou arraste para o Chrome/Edge)

  4. Clique em "Verificar conexão" para confirmar
     que o servidor está respondendo

  5. Faça upload da planilha de mapeamento
     (BPM_Mapeamento_AgentLabs_v2.xlsx)
     ou use os dados de exemplo

  6. Clique em "Gerar com IA" e aguarde

SAÍDAS GERADAS
──────────────
  • Diagrama BPMN interativo (zoom/pan)
  • Export SVG e PNG do diagrama
  • Scripts JS separados por atividade/método
  • Documentação funcional (.md)
  • Casos de teste (.md)
  • Download de tudo em .zip (inclui o .svg)

SEGURANÇA
─────────
  Sua chave de API fica apenas no terminal local.
  O server.js só aceita conexões de localhost.
  Nenhum dado é enviado para servidores terceiros
  além da API oficial da Anthropic.

═══════════════════════════════════════════════
