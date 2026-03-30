document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-chat');

  socket.emit('join_chat');

  socket.on('message', (data) => {
    appendMessage(data.user, data.text, data.user === 'System');
  });

  const appendMessage = (user, text, isSystem = false, isSelf = false) => {
    const div = document.createElement('div');
    div.classList.add('chat-message');
    if (isSystem) div.classList.add('system');
    if (isSelf) div.classList.add('self');
    
    if (isSystem) {
      div.innerText = text;
    } else {
      div.innerHTML = `<strong>${isSelf ? 'You' : user}:</strong> ${text}`;
    }
    
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  const sendMessage = () => {
    const text = chatInput.value.trim();
    if (text) {
      appendMessage('You', text, false, true);
      socket.emit('send_message', { text });
      chatInput.value = '';
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});
