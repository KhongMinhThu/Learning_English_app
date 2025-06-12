//Hàm bật/tắt side trái
export function initSidebarToggle() {
  document.getElementById("toggle-sidebar-btn")
    .addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });
}

//Hàm Chuyển đổi giữa các tab
export function initTabSwitching() {
  window.openTab = (tabId, button) => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    button.classList.add('active');
  };
  openTab('chat-tab', document.querySelector('.tab-button.active'));
}

//Hàm tạo cuộc trò chuyện mới
export function initNewChatButton() {
  document.getElementById('new-chat-btn').addEventListener('click', () => {
    document.getElementById('chat-box').innerHTML = '';
    document.getElementById('user-input').focus();
  });
}

//Hàm gửi tin nhắn
export function initSendMessage() {
  document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    sendToAI(text);
  });
}

//Hàm thêm tin nhắn vào khung chat
function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = `message ${sender}`;

  //Tạo thẻ div chứa tin nhắn mới 
  if (sender === 'bot') {
    const soundBtn = createSoundButton(text);
    div.appendChild(soundBtn);

    //Thêm nút nghe lại tin nhắn từ 'bot'
    text.split(" ").forEach(word => {
      const span = document.createElement("span");
      span.className = "word";
      span.innerText = word;
      span.onclick = (e) => lookupWord(word.replace(/[^a-zA-Z]/g, ""), e);
      div.appendChild(span);
      div.append(" ");
    });
  } else {
    div.textContent = text;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

//Mô phỏng phản hồi từ AL =>   CẦN CHỈNH SỬA ĐỂ GỌI API
function sendToAI(message) {
  appendMessage('bot', '...');
  setTimeout(() => {
    const reply = `Bạn vừa nói: "${message}" – tuyệt đấy!`;
    document.querySelector('.message.bot:last-child').remove();
    appendMessage('bot', reply);
    speak(reply);
  }, 800);
}

//Phát âm đoạn văn (Dùng Web Speech API để phát đoạn văn bản tiếng Anh)
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
}

//Tạo nút loa nghe lại
function createSoundButton(text) {
  const btn = document.createElement('button');
  btn.innerHTML = '<i class="fas fa-volume-high"></i>';
  btn.className = 'listen-btn round-btn';
  btn.title = 'Nghe lại';
  btn.onclick = () => speak(text);
  return btn;
}

// === Nhận dạng giọng nói === THAY THẾ HOẶC MỞ RỘNG API (Thêm fallback: MediaRecorder + API backend)
export function initSpeechRecognition() {
  const recognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!recognitionAPI) return;

  //Kiểm tra trình duyệt có hỗ trợ Web Speech API không?
  const recognizer = new recognitionAPI();
  recognizer.lang = 'en-US';

  const micBtn = document.getElementById('mic-btn');
  const stopBtn = document.getElementById('stop-btn');
  const input = document.getElementById('user-input');

  //Tạo đối tượng ghi âm, tham chiếu micro, stop và input
  micBtn.addEventListener('click', () => {
    recognizer.start();
    micBtn.style.display = 'none';
    document.getElementById("recording-status").style.display = 'flex';
  });

  stopBtn.addEventListener('click', () => recognizer.stop());

  //Nhân nút ghi âm
  recognizer.onresult = (e) => input.value = e.results[0][0].transcript;

  //Hoàn tất ghi âm
  recognizer.onend = () => {
    micBtn.style.display = 'inline-block';
    document.getElementById("recording-status").style.display = 'none';
  };

  recognizer.onerror = (e) => {
    alert('Lỗi nhận dạng giọng nói: ' + e.error);
    recognizer.onend();
  };
}
