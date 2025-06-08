// Main.js - Entry point to handle UI tab switching and initialization

window.openTab = (tabId, button) => {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).style.display = 'block';
  button.classList.add('active');
}

window.onload = () => {
  fetchChatHistory();
  fetchVocabulary();
}

// Toggle sidebar visibility
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleButton = document.getElementById("toggle-sidebar-btn");

  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Nút "Cuộc hội thoại mới"
  const newChatBtn = document.getElementById("new-chat-btn");
  newChatBtn.addEventListener("click", () => {
    // Chuyển sang tab chat
    openTab("chat-tab", document.querySelector(".tab-button:nth-child(1)"));

    // Xoá nội dung khung chat cũ
    const chatBox = document.getElementById("chat-box");
    if (chatBox) {
      chatBox.innerHTML = "";
    }

    // (Tuỳ chọn) Focus vào ô nhập mới
    const inputBox = document.getElementById("user-input");
    if (inputBox) {
      inputBox.focus();
    }
  });
});
