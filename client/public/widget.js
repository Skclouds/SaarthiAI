/**
 * SaarthiAI Embeddable Chat Widget
 * Usage:
 * <script src="https://YOUR_DOMAIN/widget.js" data-business-id="..." data-api-url="https://api.example.com"></script>
 */
(function () {
  'use strict';

  var script = document.currentScript || document.querySelector('script[data-business-id]');
  if (!script) return;

  var businessId = script.getAttribute('data-business-id');
  var apiUrl = (script.getAttribute('data-api-url') || 'http://localhost:5000').replace(/\/$/, '');

  if (!businessId) {
    console.error('[SaarthiAI] Missing data-business-id on script tag');
    return;
  }

  var scriptSrc = script.src || '';
  var widgetBaseUrl = scriptSrc ? scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1) : '/';
  var logoUrl = widgetBaseUrl + 'logo.png';

  /* ── Minimal Markdown → HTML (headings, lists, links, bold, tables, code) ── */
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderMarkdown(md) {
    var html = escapeHtml(md);

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, function (_, code) {
      return '<pre><code>' + code.trim() + '</code></pre>';
    });
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Bold / italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Tables (GFM)
    html = html.replace(/((?:\|.+\|\n)+)/g, function (block) {
      var rows = block.trim().split('\n').filter(function (r) { return r.trim(); });
      if (rows.length < 2) return block;
      var sep = rows[1];
      if (!/^\|[\s:|-]+\|$/.test(sep.trim())) return block;
      var out = '<table>';
      rows.forEach(function (row, i) {
        if (i === 1) return;
        var cells = row.split('|').slice(1, -1);
        var tag = i === 0 ? 'th' : 'td';
        out += '<tr>' + cells.map(function (c) { return '<' + tag + '>' + c.trim() + '</' + tag + '>'; }).join('') + '</tr>';
      });
      return out + '</table>';
    });

    // Unordered lists
    html = html.replace(/((?:^[-*] .+\n?)+)/gm, function (block) {
      var items = block.trim().split('\n').map(function (l) { return '<li>' + l.replace(/^[-*] /, '') + '</li>'; });
      return '<ul>' + items.join('') + '</ul>';
    });

    // Paragraphs
    html = html.split(/\n{2,}/).map(function (p) {
      p = p.trim();
      if (!p) return '';
      if (/^<(h[1-3]|ul|table|pre)/.test(p)) return p;
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('');

    return html;
  }

  /* ── Styles (scoped inside Shadow DOM) ── */
  var CSS = `
    :host { all: initial; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .launcher {
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483646;
      width: 56px; height: 56px; border-radius: 16px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: #fff;
      box-shadow: 0 8px 32px rgba(30,58,138,.35);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .launcher:hover { transform: scale(1.06); box-shadow: 0 12px 40px rgba(59,130,246,.4); }
    .launcher svg { width: 24px; height: 24px; fill: currentColor; }
    .panel {
      position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
      width: min(420px, calc(100vw - 32px));
      height: min(640px, calc(100vh - 48px));
      background: #fff; border-radius: 24px;
      box-shadow: 0 16px 48px rgba(15,23,42,.16);
      border: 1px solid rgba(226,232,240,.8);
      display: flex; flex-direction: column; overflow: hidden;
      font-size: 14px; color: #0f172a;
    }
    .panel.hidden { display: none; }
    .header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; background: linear-gradient(90deg, #0F172A, #1E3A8A, #3B82F6); color: #fff; flex-shrink: 0;
    }
    .header-info { display: flex; align-items: center; gap: 10px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #fff; overflow: hidden; flex-shrink: 0;
      border: 1px solid rgba(255,255,255,.25);
    }
    .avatar img, .msg-avatar img {
      width: 100%; height: 100%; object-fit: cover; object-position: 50% 8%;
      display: block;
    }
    .header-title { font-weight: 600; font-size: 14px; }
    .header-status { font-size: 11px; color: #c7d2fe; }
    .close-btn {
      background: none; border: none; color: #fff; cursor: pointer;
      padding: 6px; border-radius: 8px; opacity: .8;
    }
    .close-btn:hover { background: rgba(255,255,255,.1); opacity: 1; }
    .messages {
      flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc;
      display: flex; flex-direction: column; gap: 12px;
    }
    .msg-row { display: flex; gap: 8px; }
    .msg-row.user { flex-direction: row-reverse; }
    .msg-avatar {
      width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; margin-top: 2px;
    }
    .msg-avatar.bot { background: #fff; border-radius: 50%; border: 1px solid #e2e8f0; overflow: hidden; }
    .msg-bubble {
      max-width: 85%; padding: 10px 14px; border-radius: 16px; line-height: 1.5; font-size: 13px;
    }
    .msg-bubble.user { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: #fff; border-bottom-right-radius: 6px; }
    .msg-bubble.bot {
      background: #fff; color: #334155; border: 1px solid #e2e8f0;
      border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,.04);
    }
    .msg-bubble.bot h1,.msg-bubble.bot h2,.msg-bubble.bot h3 { font-weight: 600; margin: 8px 0 4px; color: #0f172a; }
    .msg-bubble.bot h1 { font-size: 15px; } .msg-bubble.bot h2,.msg-bubble.bot h3 { font-size: 14px; }
    .msg-bubble.bot p { margin: 0 0 6px; } .msg-bubble.bot p:last-child { margin: 0; }
    .msg-bubble.bot ul,.msg-bubble.bot ol { margin: 4px 0; padding-left: 18px; }
    .msg-bubble.bot a { color: #4f46e5; }
    .msg-bubble.bot code { background: #f1f5f9; padding: 1px 4px; border-radius: 4px; font-size: 12px; }
    .msg-bubble.bot pre { background: #f1f5f9; padding: 8px; border-radius: 8px; overflow-x: auto; margin: 6px 0; font-size: 12px; }
    .msg-bubble.bot table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 12px; }
    .msg-bubble.bot th,.msg-bubble.bot td { border: 1px solid #e2e8f0; padding: 4px 8px; text-align: left; }
    .msg-bubble.bot th { background: #f1f5f9; }
    .unanswered-tag { font-size: 11px; color: #d97706; font-weight: 500; margin-top: 6px; }
    .sources { padding: 10px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 4px; }
    .sources-label { font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 6px; }
    .source-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .source-tag {
      font-size: 11px; padding: 2px 8px; border-radius: 6px;
      background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;
    }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 8px; flex-shrink: 0; }
    .chip {
      font-size: 12px; padding: 8px 14px; border-radius: 12px; cursor: pointer;
      border: 1px solid rgba(59,130,246,.25); background: #EFF6FF; color: #1E3A8A;
      transition: background .15s, border-color .15s; font-weight: 500;
    }
    .chip:hover { background: #DBEAFE; border-color: rgba(59,130,246,.4); }
    .chip:disabled { opacity: .5; cursor: not-allowed; }
    .typing { display: flex; gap: 4px; padding: 10px 14px; }
    .typing span {
      width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1;
      animation: bounce .6s infinite alternate;
    }
    .typing span:nth-child(2) { animation-delay: .15s; }
    .typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes bounce { to { opacity: .3; transform: translateY(-4px); } }
    .input-area {
      display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #e2e8f0;
      background: #fff; flex-shrink: 0;
    }
    .input-area input {
      flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 12px;
      font-size: 13px; outline: none; font-family: inherit;
    }
    .input-area input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
    .send-btn {
      padding: 10px; border: none; border-radius: 12px;
      background: linear-gradient(135deg, #1E3A8A, #3B82F6);
      color: #fff; cursor: pointer; display: flex; align-items: center;
    }
    .send-btn:hover { opacity: .92; }
    .send-btn:disabled { opacity: .45; cursor: not-allowed; }
    .send-btn svg { width: 16px; height: 16px; fill: currentColor; }
    .msg-feedback { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
    .feedback-btn {
      padding: 5px; border: none; border-radius: 8px; cursor: pointer;
      background: transparent; color: #94a3b8; display: flex; align-items: center;
      transition: background .15s, color .15s;
    }
    .feedback-btn:hover:not(:disabled) { background: #EFF6FF; color: #3B82F6; }
    .feedback-btn.active-up { background: #ecfdf5; color: #059669; }
    .feedback-btn.active-down { background: #fef2f2; color: #dc2626; }
    .feedback-btn:disabled { opacity: .5; cursor: not-allowed; }
    .feedback-btn svg { width: 14px; height: 14px; fill: currentColor; }
    .feedback-thanks { font-size: 11px; color: #94a3b8; margin-top: 8px; }
  `;

  var ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  function logoAvatarHtml() {
    return '<img src="' + logoUrl + '" alt="SaarthiAI logo" width="28" height="28" />';
  }
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var ICON_THUMBS_UP = '<svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>';
  var ICON_THUMBS_DOWN = '<svg viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23 16.41 16.41c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>';

  /* ── State ── */
  var state = {
    open: false,
    botName: 'SaarthiAI',
    welcomeMessage: '',
    suggestedQuestions: [],
    messages: [],
    sources: [],
    conversationId: null,
    loading: false,
    initialized: false,
    customerName: 'Website Visitor',
    customerEmail: 'visitor-' + Math.random().toString(36).slice(2, 10) + '@embed.saarthi.ai',
    feedback: {},
    feedbackSubmitting: null,
  };

  /* ── DOM refs ── */
  var host = document.createElement('div');
  host.id = 'saarthi-widget-root';
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: 'open' });

  var style = document.createElement('style');
  style.textContent = CSS;
  shadow.appendChild(style);

  var launcher = document.createElement('button');
  launcher.className = 'launcher';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.innerHTML = ICON_CHAT;

  var panel = document.createElement('div');
  panel.className = 'panel hidden';
  panel.innerHTML =
    '<div class="header">' +
      '<div class="header-info"><div class="avatar">' + logoAvatarHtml() + '</div>' +
        '<div><div class="header-title" id="saarthi-bot-name">SaarthiAI</div>' +
        '<div class="header-status">Online</div></div></div>' +
      '<button class="close-btn" id="saarthi-close">' + ICON_CLOSE + '</button></div>' +
    '<div class="messages" id="saarthi-messages"></div>' +
    '<div class="chips" id="saarthi-chips"></div>' +
    '<form class="input-area" id="saarthi-form">' +
      '<input type="text" id="saarthi-input" placeholder="Type your message…" autocomplete="off">' +
      '<button type="submit" class="send-btn" id="saarthi-send">' + ICON_SEND + '</button></form>';

  shadow.appendChild(launcher);
  shadow.appendChild(panel);

  var elMessages = shadow.getElementById('saarthi-messages');
  var elChips = shadow.getElementById('saarthi-chips');
  var elInput = shadow.getElementById('saarthi-input');
  var elBotName = shadow.getElementById('saarthi-bot-name');
  var elForm = shadow.getElementById('saarthi-form');
  var elSend = shadow.getElementById('saarthi-send');

  function apiFetch(path, opts) {
    return fetch(apiUrl + path, opts).then(function (res) {
      if (!res.ok) throw new Error('API error ' + res.status);
      return res.json();
    });
  }

  function loadConfig() {
    return Promise.all([
      apiFetch('/chat/config?businessId=' + encodeURIComponent(businessId)),
      apiFetch('/chat/suggested-questions?businessId=' + encodeURIComponent(businessId)),
    ]).then(function (results) {
      state.botName = results[0].config.botName || 'SaarthiAI';
      state.welcomeMessage = results[0].config.welcomeMessage || 'Hello! How can I help you today?';
      state.suggestedQuestions = results[1].questions || [];
      state.initialized = true;
      elBotName.textContent = state.botName;
    }).catch(function () {
      state.welcomeMessage = 'Hello! How can I help you today?';
      state.suggestedQuestions = ['Track my order', 'Pricing', 'Refund policy', 'Contact support'];
      state.initialized = true;
    });
  }

  function render() {
    elMessages.innerHTML = '';

    if (state.welcomeMessage && state.messages.length === 0) {
      var welcome = document.createElement('div');
      welcome.className = 'msg-row';
      welcome.innerHTML =
        '<div class="msg-avatar bot">' + logoAvatarHtml() + '</div>' +
        '<div class="msg-bubble bot">' + escapeHtml(state.welcomeMessage) + '</div>';
      elMessages.appendChild(welcome);
    }

    state.messages.forEach(function (msg) {
      var row = document.createElement('div');
      row.className = 'msg-row' + (msg.role === 'USER' ? ' user' : '');
      if (msg.role === 'USER') {
        row.innerHTML = '<div class="msg-bubble user">' + escapeHtml(msg.content) + '</div>';
      } else {
        var unanswered = msg.unanswered ? '<div class="unanswered-tag">Routed for human follow-up</div>' : '';
        var feedbackHtml = '';
        var canRate = msg.id && msg.id.indexOf('err-') !== 0 && msg.id.indexOf('u-') !== 0;
        if (canRate) {
          var fb = state.feedback[msg.id];
          if (fb === 'thanks') {
            feedbackHtml = '<div class="feedback-thanks">Thanks for your feedback</div>';
          } else {
            var upCls = fb === 'UP' ? ' active-up' : '';
            var downCls = fb === 'DOWN' ? ' active-down' : '';
            var disabled = state.feedbackSubmitting === msg.id ? ' disabled' : '';
            feedbackHtml =
              '<div class="msg-feedback">' +
                '<button type="button" class="feedback-btn' + upCls + disabled + '" data-fb="UP" data-msg="' + msg.id + '">' + ICON_THUMBS_UP + '</button>' +
                '<button type="button" class="feedback-btn' + downCls + disabled + '" data-fb="DOWN" data-msg="' + msg.id + '">' + ICON_THUMBS_DOWN + '</button>' +
              '</div>';
          }
        }
        row.innerHTML =
          '<div class="msg-avatar bot">' + logoAvatarHtml() + '</div>' +
          '<div class="msg-bubble bot">' + renderMarkdown(msg.content) + unanswered + feedbackHtml + '</div>';
      }
      elMessages.appendChild(row);
    });

    if (state.sources.length > 0 && state.messages.length > 0 && !state.loading) {
      var srcDiv = document.createElement('div');
      srcDiv.className = 'sources';
      srcDiv.innerHTML = '<div class="sources-label">Sources</div><div class="source-tags"></div>';
      var tags = srcDiv.querySelector('.source-tags');
      state.sources.forEach(function (s) {
        var tag = document.createElement('span');
        tag.className = 'source-tag';
        tag.textContent = s.filename;
        tags.appendChild(tag);
      });
      elMessages.appendChild(srcDiv);
    }

    if (state.loading) {
      var typing = document.createElement('div');
      typing.className = 'msg-row';
      typing.innerHTML =
        '<div class="msg-avatar bot">' + logoAvatarHtml() + '</div>' +
        '<div class="msg-bubble bot"><div class="typing"><span></span><span></span><span></span></div></div>';
      elMessages.appendChild(typing);
    }

    elMessages.scrollTop = elMessages.scrollHeight;

    elChips.innerHTML = '';
    if (state.messages.length === 0 && state.suggestedQuestions.length > 0) {
      state.suggestedQuestions.forEach(function (q) {
        var chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = q;
        chip.disabled = state.loading;
        chip.addEventListener('click', function () { sendMessage(q); });
        elChips.appendChild(chip);
      });
    }

    elMessages.querySelectorAll('.feedback-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var msgId = btn.getAttribute('data-msg');
        var rating = btn.getAttribute('data-fb');
        if (!msgId || !rating || state.feedback[msgId]) return;
        submitFeedback(msgId, rating);
      });
    });

    elInput.disabled = state.loading;
    elSend.disabled = state.loading || !elInput.value.trim();
  }

  function submitFeedback(messageId, rating) {
    if (state.feedback[messageId] || state.feedbackSubmitting === messageId) return;
    state.feedbackSubmitting = messageId;
    render();
    apiFetch('/chat/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: messageId, rating: rating }),
    }).then(function () {
      state.feedback[messageId] = 'thanks';
    }).catch(function () {
      delete state.feedback[messageId];
    }).finally(function () {
      state.feedbackSubmitting = null;
      render();
    });
  }

  function sendMessage(text) {
    var trimmed = (text || '').trim();
    if (!trimmed || state.loading) return;

    elInput.value = '';
    state.messages.push({ id: 'u-' + Date.now(), role: 'USER', content: trimmed });
    state.loading = true;
    render();

    var payload = {
      businessId: businessId,
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      message: trimmed,
    };
    if (state.conversationId) {
      payload.conversationId = state.conversationId;
    }

    apiFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (data) {
      state.conversationId = data.conversationId;
      state.sources = data.sources || [];
      state.messages.push({
        id: data.message.id,
        role: 'ASSISTANT',
        content: data.message.content,
        unanswered: data.message.unanswered,
      });
    }).catch(function () {
      state.messages.push({
        id: 'err-' + Date.now(),
        role: 'ASSISTANT',
        content: 'Sorry, something went wrong. Please try again.',
      });
    }).finally(function () {
      state.loading = false;
      render();
    });
  }

  launcher.addEventListener('click', function () {
    state.open = true;
    launcher.style.display = 'none';
    panel.classList.remove('hidden');
    if (!state.initialized) {
      loadConfig().then(render);
    } else {
      render();
    }
  });

  shadow.getElementById('saarthi-close').addEventListener('click', function () {
    state.open = false;
    panel.classList.add('hidden');
    launcher.style.display = 'flex';
  });

  elForm.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage(elInput.value);
  });

  elInput.addEventListener('input', function () {
    elSend.disabled = state.loading || !elInput.value.trim();
  });
})();
