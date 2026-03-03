<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chat App</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #1a1a1a;
      --sidebar-bg: #151515;
      --surface: #242424;
      --surface-hover: #2e2e2e;
      --border: #2e2e2e;
      --text: #e8e8e8;
      --text-muted: #888;
      --text-faint: #555;
      --accent: #d97757;
      --accent-light: #e8926e;
      --pill-bg: #2a2a2a;
      --pill-border: #383838;
      --pill-hover: #333;
      --input-bg: #222;
      --scrollbar: #333;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ── SIDEBAR ── */
    .sidebar {
      width: 56px;
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 0;
      gap: 4px;
      border-right: 1px solid var(--border);
      flex-shrink: 0;
      transition: width .2s ease;
    }

    .sidebar.expanded { width: 220px; align-items: flex-start; padding: 12px 8px; }

    .sidebar-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s, color .15s;
      flex-shrink: 0;
    }

    .sidebar-btn:hover { background: var(--surface-hover); color: var(--text); }
    .sidebar-btn svg { width: 18px; height: 18px; }

    .sidebar-spacer { flex: 1; }

    .avatar-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3a5fd9;
      border: none;
      cursor: pointer;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notif-wrap { position: relative; }
    .notif-dot {
      position: absolute;
      top: 3px; right: 3px;
      width: 7px; height: 7px;
      background: #3a7ff5;
      border-radius: 50%;
      border: 1.5px solid var(--sidebar-bg);
    }

    /* ── MAIN ── */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--scrollbar) transparent;
    }

    .main::-webkit-scrollbar { width: 6px; }
    .main::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 3px; }

    /* ── TOP BAR ── */
    .topbar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      position: sticky;
      top: 0;
      background: var(--bg);
      z-index: 10;
    }

    .topbar-right { display: flex; align-items: center; gap: 8px; }

    .plan-badge {
      font-size: 12px;
      color: var(--text-muted);
      background: var(--surface);
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }

    .upgrade-btn {
      font-size: 12px;
      color: var(--text);
      background: var(--surface);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: background .15s;
    }
    .upgrade-btn:hover { background: var(--surface-hover); }

    .ghost-icon {
      width: 32px; height: 32px;
      color: var(--text-muted);
      cursor: pointer;
    }

    /* ── HERO ── */
    .hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px 0;
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 500;
      color: var(--text);
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      gap: 14px;
      letter-spacing: -0.5px;
    }

    .asterisk {
      color: var(--accent);
      font-size: 1.1em;
      line-height: 1;
      animation: spin 8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ── INPUT BOX ── */
    .input-card {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px 16px 12px;
      margin-bottom: 20px;
    }

    .input-textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text);
      font-size: 15px;
      line-height: 1.5;
      resize: none;
      min-height: 56px;
      font-family: inherit;
    }

    .input-textarea::placeholder { color: var(--text-faint); }

    .input-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
    }

    .input-footer-left { display: flex; align-items: center; gap: 8px; }

    .add-btn {
      width: 30px; height: 30px;
      border-radius: 50%;
      background: transparent;
      border: 1.5px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s, color .15s;
    }
    .add-btn:hover { background: var(--surface-hover); color: var(--text); }

    .model-select {
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      display: flex; align-items: center; gap: 4px;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background .15s;
    }
    .model-select:hover { background: var(--surface-hover); color: var(--text); }

    .voice-btn {
      width: 30px; height: 30px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px;
      transition: background .15s, color .15s;
    }
    .voice-btn:hover { background: var(--surface-hover); color: var(--text); }

    .send-btn {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s, transform .1s;
    }
    .send-btn:hover { background: var(--accent-light); transform: scale(1.05); }
    .send-btn svg { width: 16px; height: 16px; }

    /* ── PILLS ── */
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      padding-bottom: 40px;
    }

    .pill {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: var(--pill-bg);
      border: 1px solid var(--pill-border);
      border-radius: 20px;
      color: var(--text-muted);
      font-size: 13px;
      cursor: pointer;
      transition: background .15s, color .15s, border-color .15s;
      white-space: nowrap;
    }
    .pill:hover { background: var(--pill-hover); color: var(--text); border-color: #444; }
    .pill svg { width: 14px; height: 14px; flex-shrink: 0; }

    /* ── CHAT MESSAGES (shown after send) ── */
    .messages {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      padding: 0 24px 160px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .msg { display: flex; flex-direction: column; gap: 6px; }
    .msg.user { align-items: flex-end; }
    .msg.assistant { align-items: flex-start; }

    .msg-bubble {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.6;
    }

    .msg.user .msg-bubble {
      background: var(--surface);
      border: 1px solid var(--border);
      border-bottom-right-radius: 4px;
    }

    .msg.assistant .msg-bubble {
      background: transparent;
      color: var(--text);
      border-bottom-left-radius: 4px;
      max-width: 90%;
    }

    .msg-label {
      font-size: 11px;
      color: var(--text-faint);
      padding: 0 4px;
    }

    /* ── FLOATING INPUT (chat mode) ── */
    .chat-input-wrap {
      position: fixed;
      bottom: 0;
      left: 56px;
      right: 0;
      background: linear-gradient(to top, var(--bg) 60%, transparent);
      padding: 16px 24px 20px;
      display: flex;
      justify-content: center;
    }

    .chat-input-inner {
      width: 100%;
      max-width: 760px;
    }

    /* ── TYPING INDICATOR ── */
    .typing { display: flex; gap: 4px; padding: 10px 0; }
    .typing span {
      width: 7px; height: 7px;
      background: var(--text-muted);
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: .2s; }
    .typing span:nth-child(3) { animation-delay: .4s; }

    @keyframes bounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* ── HIDDEN ── */
    .hidden { display: none !important; }
  </style>
</head>
<body>

<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
  <button class="sidebar-btn" onclick="toggleSidebar()" title="Menu">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
  </button>
  <button class="sidebar-btn" title="Nova conversa" onclick="newChat()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  </button>
  <button class="sidebar-btn" title="Buscar">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  </button>
  <button class="sidebar-btn" title="Projetos">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  </button>
  <button class="sidebar-btn" title="Conversas">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  </button>
  <button class="sidebar-btn" title="Lixeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
  </button>
  <button class="sidebar-btn" title="Times">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  </button>
  <button class="sidebar-btn" title="API">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  </button>

  <div class="sidebar-spacer"></div>

  <div class="notif-wrap">
    <button class="sidebar-btn" title="Novidades">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <div class="notif-dot"></div>
    </button>
  </div>

  <button class="avatar-btn" title="Perfil">B</button>
</aside>

<!-- MAIN -->
<main class="main" id="main">

  <!-- TOP BAR -->
  <div class="topbar">
    <div></div>
    <div class="topbar-right">
      <span class="plan-badge">plano Gratuito</span>
      <button class="upgrade-btn">Fazer Upgrade</button>
      <svg class="ghost-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 10h.01M15 10h.01M12 2a10 10 0 0 1 10 10v8l-3-2-3 2-3-2-3 2-3-2-3 2v-8A10 10 0 0 1 12 2z"/>
      </svg>
    </div>
  </div>

  <!-- HERO (home state) -->
  <section class="hero" id="hero">
    <h1 class="hero-title">
      <span class="asterisk">✳</span>
      Hora do café com Claude?
    </h1>

    <div class="input-card">
      <textarea
        class="input-textarea"
        id="heroInput"
        placeholder="Como posso ajudar você hoje?"
        rows="2"
        onkeydown="handleKey(event, 'heroInput')"
        oninput="autoResize(this)"
      ></textarea>
      <div class="input-footer">
        <div class="input-footer-left">
          <button class="add-btn" title="Anexar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="model-select" onclick="cycleModel()">
            <span id="modelName">Sonnet 4.6</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="voice-btn" title="Voz">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button class="send-btn" onclick="sendMessage('heroInput')" title="Enviar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <div class="pills">
      <button class="pill" onclick="fillPrompt('Escrever um texto criativo')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        Escrever
      </button>
      <button class="pill" onclick="fillPrompt('Me ensine sobre um tema interessante')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Aprender
      </button>
      <button class="pill" onclick="fillPrompt('Me ajude com um problema de código')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        Código
      </button>
      <button class="pill" onclick="fillPrompt('Me ajude a organizar minha rotina')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
        Assuntos pessoais
      </button>
      <button class="pill" onclick="fillPrompt('Me surpreenda com algo interessante')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Escolha do Claude
      </button>
    </div>
  </section>

  <!-- CHAT STATE -->
  <div class="messages hidden" id="messages"></div>

  <!-- FLOATING INPUT (chat mode) -->
  <div class="chat-input-wrap hidden" id="chatInputWrap">
    <div class="chat-input-inner">
      <div class="input-card" style="margin:0">
        <textarea
          class="input-textarea"
          id="chatInput"
          placeholder="Mensagem…"
          rows="1"
          onkeydown="handleKey(event, 'chatInput')"
          oninput="autoResize(this)"
        ></textarea>
        <div class="input-footer">
          <div class="input-footer-left">
            <button class="add-btn" title="Anexar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button class="model-select" onclick="cycleModel()">
              <span id="modelName2">Sonnet 4.6</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <button class="voice-btn" title="Voz">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </button>
            <button class="send-btn" onclick="sendMessage('chatInput')" title="Enviar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</main>

<script>
  const models = ['Sonnet 4.6', 'Opus 4.6', 'Haiku 4.5'];
  let modelIdx = 0;
  let chatMode = false;

  // Responses pool for demo
  const demoReplies = [
    'Claro! Posso te ajudar com isso. Qual é o próximo passo que você quer dar?',
    'Boa pergunta! Existem várias abordagens para isso. Vamos explorar juntos?',
    'Entendido. Aqui está o que eu sugiro para começar...',
    'Interessante! Isso tem muitas possibilidades. Me diga mais sobre o contexto.',
    'Perfeito. Vou te ajudar a resolver isso de forma prática e eficiente.',
  ];

  function cycleModel() {
    modelIdx = (modelIdx + 1) % models.length;
    document.getElementById('modelName').textContent = models[modelIdx];
    document.getElementById('modelName2').textContent = models[modelIdx];
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('expanded');
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function fillPrompt(text) {
    const el = document.getElementById('heroInput');
    el.value = text;
    el.focus();
    autoResize(el);
  }

  function handleKey(e, inputId) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputId);
    }
  }

  function sendMessage(inputId) {
    const el = document.getElementById(inputId);
    const text = el.value.trim();
    if (!text) return;
    el.value = '';
    el.style.height = 'auto';

    if (!chatMode) enterChatMode();

    appendMessage('user', text);

    // typing indicator
    const typingId = appendTyping();

    setTimeout(() => {
      removeTyping(typingId);
      const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
      appendMessage('assistant', reply);
      document.getElementById('chatInput').focus();
    }, 900 + Math.random() * 600);
  }

  function enterChatMode() {
    chatMode = true;
    document.getElementById('hero').classList.add('hidden');
    document.getElementById('messages').classList.remove('hidden');
    document.getElementById('chatInputWrap').classList.remove('hidden');
    setTimeout(() => document.getElementById('chatInput').focus(), 100);
  }

  function newChat() {
    chatMode = false;
    document.getElementById('hero').classList.remove('hidden');
    document.getElementById('messages').classList.add('hidden');
    document.getElementById('chatInputWrap').classList.add('hidden');
    document.getElementById('messages').innerHTML = '';
    document.getElementById('heroInput').focus();
  }

  function appendMessage(role, text) {
    const wrap = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ${role}`;

    const label = document.createElement('div');
    label.className = 'msg-label';
    label.textContent = role === 'user' ? 'Você' : 'Claude';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    div.appendChild(label);
    div.appendChild(bubble);
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
    document.getElementById('main').scrollTop = document.getElementById('main').scrollHeight;
  }

  function appendTyping() {
    const wrap = document.getElementById('messages');
    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg assistant';
    div.id = id;

    const label = document.createElement('div');
    label.className = 'msg-label';
    label.textContent = 'Claude';

    const indicator = document.createElement('div');
    indicator.className = 'typing';
    indicator.innerHTML = '<span></span><span></span><span></span>';

    div.appendChild(label);
    div.appendChild(indicator);
    wrap.appendChild(div);
    document.getElementById('main').scrollTop = document.getElementById('main').scrollHeight;
    return id;
  }

  function removeTyping(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
</script>
</body>
</html>