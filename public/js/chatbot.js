document.addEventListener('DOMContentLoaded', () => {
  // Inject HTML for floating chatbot
  const widgetHTML = `
    <div id="floating-chatbot">
      <div id="chat-widget-window" class="hidden">
        <div id="chat-widget-header">
          MindSpace AI
          <span id="close-chat-btn" style="cursor: pointer; font-size: 1.2rem;">&times;</span>
        </div>
        <div id="chat-widget-body">
          <div class="bot-msg">Hi! How can I support you today?</div>
        </div>
        <div id="chat-widget-input-area">
          <input type="text" id="chat-widget-input" placeholder="Type a message...">
          <button id="chat-widget-send">Send</button>
        </div>
      </div>
      <button id="chat-bubble-btn" style="float:right;">💬</button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const bubbleBtn = document.getElementById('chat-bubble-btn');
  const chatWindow = document.getElementById('chat-widget-window');
  const closeBtn = document.getElementById('close-chat-btn');
  const sendBtn = document.getElementById('chat-widget-send');
  const inputField = document.getElementById('chat-widget-input');
  const bodyArea = document.getElementById('chat-widget-body');

  bubbleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
      inputField.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
  });

  const appendMessage = (text, isUser = false) => {
    const div = document.createElement('div');
    div.classList.add(isUser ? 'user-msg' : 'bot-msg');
    div.innerText = text;
    bodyArea.appendChild(div);
    bodyArea.scrollTop = bodyArea.scrollHeight;
  };

  const sendMessage = async () => {
    const text = inputField.value.trim();
    if (!text) return;
    
    appendMessage(text, true);
    inputField.value = '';

    try {
      // Re-use the existing /api/chat route logic
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      appendMessage(data.text || "I'm having trouble connecting right now.");
    } catch (err) {
      appendMessage("Network error, unable to reach the AI.");
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});
