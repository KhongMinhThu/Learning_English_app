// Dữ liệu hội thoại mẫu (thay bằng dữ liệu thật từ localStorage hoặc server)
//=>THAY THẾ BẰNG DỮ LIỆU THẬT
const chatHistory = [
  {
    title: "Chào hỏi đầu tiên",
    timestamp: "2025-05-28 08:30",
    messages: [
      { sender: 'user', text: "Hello!" },
      { sender: 'bot', text: "Hi! How can I help you today?" }
    ]
  },
  {
    title: "Hỏi thời tiết",
    timestamp: "2025-05-28 10:00",
    messages: [
      { sender: 'user', text: "What's the weather like?" },
      { sender: 'bot', text: "It's sunny and warm!" }
    ]
  }
];

//Khởi tạo sự kiện cho tab "Lịch sử hội thoại"
export function initHistoryTab() {
  const btn = document.querySelector('button[onclick*="openTab(\'history-tab"]');
  if (btn) btn.addEventListener('click', renderHistoryList);
}

// Hiển thị danh sách các phiên trò chuyện đã lưu (lịch sử)
function renderHistoryList() {
  const list = document.getElementById("history-list"); // Vùng danh sách lịch sử
  list.innerHTML = ''; // Xóa nội dung cũ (nếu có)

  chatHistory.forEach((session, index) => {
    const item = document.createElement("div");
    item.className = "history-item"; // Dùng cho CSS định dạng
    item.innerHTML = `<strong>${session.title}</strong><br><small>${session.timestamp}</small>`;
    
    // Khi click vào phiên nào -> hiển thị chi tiết
    item.onclick = () => showHistoryDetail(index);

    list.appendChild(item); // Thêm vào danh sách
  });
}

// Hiển thị chi tiết một phiên trò chuyện cụ thể
function showHistoryDetail(index) {
  const detail = document.getElementById("history-detail");
  const messagesDiv = document.getElementById("history-messages");
  messagesDiv.innerHTML = ''; // Xóa nội dung cũ

  const session = chatHistory[index]; // Lấy phiên theo chỉ số

  session.messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message ' + msg.sender; // 'user' hoặc 'bot'

    // Tạo thẻ chứa văn bản
    const span = document.createElement('span');
    span.textContent = msg.text;

    // Nút nghe lại (phát âm)
    const soundBtn = document.createElement('button');
    soundBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
    soundBtn.className = 'listen-btn round-btn';
    soundBtn.title = 'Nghe lại';
    soundBtn.onclick = () => speak(msg.text);

    // Gắn văn bản và nút nghe vào khối tin nhắn
    div.appendChild(span);
    div.appendChild(soundBtn);

    // Thêm khối vào vùng hiển thị
    messagesDiv.appendChild(div);
  });

  // Hiển thị giao diện chi tiết, ẩn danh sách
  document.getElementById("history-list").style.display = "none";
  detail.style.display = "block";
}


// Ẩn giao diện chi tiết và quay lại danh sách các phiên
export function hideHistoryDetail() {
  document.getElementById("history-detail").style.display = "none";
  document.getElementById("history-list").style.display = "flex";
}


// Phát âm văn bản bằng Web Speech API
//=> Nâng cấp speak(text) nếu cần phát âm cao cấp
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // Ngôn ngữ phát âm là tiếng Anh
  speechSynthesis.speak(utterance); // Gọi trình phát âm
}

