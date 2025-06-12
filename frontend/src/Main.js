// Import các hàm khởi tạo từ module Chat.js
import {
  initSidebarToggle,        // Bật/tắt sidebar bên trái
  initTabSwitching,         // Chuyển tab Hội thoại / Lịch sử / Từ vựng
  initNewChatButton,        // Nút bắt đầu cuộc trò chuyện mới
  initSendMessage,          // Nút gửi tin nhắn
  initSpeechRecognition     // Tính năng ghi âm giọng nói và chuyển thành văn bản
} from './Chat.js';

// Import các hàm khởi tạo từ module Vocab.js
import {
  initPopupControls,        // Nút đóng popup từ vựng, nút nghe phát âm
  initVocabControls         // Xử lý danh sách từ đã tra: tìm kiếm, xoá, phát âm
} from './Vocab.js';

// Import các hàm từ module History.js
import {
  initHistoryTab,           // Khi mở tab "Lịch sử", hiển thị danh sách hội thoại
  hideHistoryDetail         // Ẩn chi tiết, quay lại danh sách hội thoại
} from './History.js';


//Hàm chính khởi chạy sau khi trang HTML đã tải xong toàn bộ
document.addEventListener("DOMContentLoaded", () => {

  //Khởi tạo tính năng UI chính
  initSidebarToggle();      // Mở/đóng sidebar
  initTabSwitching();       // Chuyển tab hiển thị

  //Khởi tạo chức năng trò chuyện
  initNewChatButton();      // Xoá khung chat cũ, bắt đầu chat mới
  initSendMessage();        // Gửi tin nhắn văn bản
  initSpeechRecognition();  // Ghi âm chuyển thành văn bản bằng giọng nói

  //Khởi tạo popup từ vựng
  initPopupControls();      // Nút đóng popup + nút phát âm
  initVocabControls();      // Tìm kiếm, phát âm, xoá từ đã tra

  //Khởi tạo giao diện lịch sử
  initHistoryTab();         // Khi người dùng mở tab lịch sử, render danh sách
});


