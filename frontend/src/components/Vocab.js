let vocabList = [];       // Mảng lưu danh sách từ đã tra => Thay bằng lưu vào localStorage hoặc gửi/lấy từ backend API
let currentAudio = null;  // Đối tượng Audio hiện tại (dùng phát âm)


export function initPopupControls() {
  // Nút đóng popup từ vựng
  document.getElementById("closePopup").onclick = () => {
    document.getElementById("vocabPopup").style.display = "none";
  };

  // Nút phát âm trong popup
  document.getElementById("vocabAudioBtn").onclick = () => {
    if (currentAudio) currentAudio.play();
  };
}

export function initVocabControls() {
  // Xoá tất cả từ đã tra
  document.getElementById("clearAllVocab").addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn xoá tất cả?")) {
      vocabList = [];
      renderVocabList();
    }
  });

  // Tìm kiếm theo từ khoá
  document.getElementById("vocabSearch").addEventListener("input", renderVocabList);
}

//Hàm chính tra từ vựng (tra API từ điển và dịch nghĩa)
//=> Có thể giữ nguyên hoặc chuyển sang gọi từ backend proxy để tránh CORS/lỗi quota
window.lookupWord = function(word, event) {
  const popup = document.getElementById("vocabPopup");
  const rect = event.target.getBoundingClientRect(); // Vị trí từ

  // Bắt đầu hiển thị popup (ẩn mờ trước để chờ layout)
  popup.style.opacity = "0";
  popup.style.display = "block";

  // Hiển thị popup ngay trên từ đã nhấn
  requestAnimationFrame(() => {
    const popupHeight = popup.offsetHeight;
    const top = rect.top + window.scrollY - popupHeight - 10;
    const left = rect.left + window.scrollX;
    popup.style.top = `${Math.max(top, 10)}px`;
    popup.style.left = `${left}px`;
    popup.style.opacity = "1";
  });

  // Gọi API từ điển
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => res.json())
    .then(data => {
      const entry = data[0];
      const definitionEn = entry.meanings[0].definitions[0].definition;
      const phonetic = entry.phonetics[0]?.text || "Không có";
      const audio = entry.phonetics[0]?.audio;

      // Hiển thị nội dung popup
      document.getElementById("popupWord").innerText = `📘 ${word}`;
      document.getElementById("popupPhonetic").innerText = `Phonetic: ${phonetic}`;
      document.getElementById("popupMeaningEn").innerText = `Meaning (EN): ${definitionEn}`;
      document.getElementById("popupMeaningVi").innerText = "Đang dịch...";

      currentAudio = audio ? new Audio(audio) : null;

      // Lưu từ vào danh sách
      addToVocabList(word, phonetic, definitionEn, "Ví dụ sẽ bổ sung", audio);

      // Gọi thêm API dịch nghĩa tiếng Việt
      return fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(definitionEn)}`);
    })
    .then(res => res.json())
    .then(translateData => {
      const translated = translateData[0][0][0];
      document.getElementById("popupMeaningVi").innerText = `Nghĩa (VI): ${translated}`;
    })
    .catch(() => {
      // Nếu lỗi → thông báo không tìm thấy từ
      document.getElementById("popupWord").innerText = `❌ Không tìm thấy từ "${word}"`;
      document.getElementById("popupPhonetic").innerText = "";
      document.getElementById("popupMeaningEn").innerText = "";
      document.getElementById("popupMeaningVi").innerText = "";
    });
};

//Thêm từ vào danh sách 
//=> Sau khi thêm, hãy gọi localStorage.setItem(...) hoặc POST /api/vocab để lưu vĩnh viễn
function addToVocabList(word, phonetic, meaning, example, audio) {
  vocabList.push({ word, phonetic, meaning, example, audio });
  renderVocabList();
}

//Hiển thị danh sách từ vựng đã tra
function renderVocabList() {
  const listDiv = document.getElementById("vocab-list");
  const keyword = document.getElementById("vocabSearch").value.toLowerCase();
  listDiv.innerHTML = '';

  // Lọc và hiển thị các từ khớp với từ khoá tìm kiếm
  vocabList.filter(item => item.word.toLowerCase().includes(keyword))
    .forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "vocab-item";
      div.innerHTML = `
        <h4>${item.word}</h4>
        <div class="phonetic">${item.phonetic}</div>
        <div><strong>Meaning:</strong> ${item.meaning}</div>
        <div><strong>Example:</strong> ${item.example}</div>
        <button onclick="playVocabAudio(${index})">🔊 Phát âm</button>
        <button onclick="removeVocab(${index})">❌ Xoá</button>
      `;
      listDiv.appendChild(div);
    });
}

// Phát âm lại từ đã lưu
window.playVocabAudio = function(index) {
  const audioURL = vocabList[index].audio;
  if (audioURL) new Audio(audioURL).play();
};

//Xoá một từ khỏi danh dách
//Nếu dùng backend, gọi DELETE /api/vocab/:id hoặc lọc từ localStorage và cập nhật lại
window.removeVocab = function(index) {
  vocabList.splice(index, 1);
  renderVocabList();
};
