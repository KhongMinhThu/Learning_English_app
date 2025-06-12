// Vocab.js - Handles displaying previously looked-up vocabulary

async function fetchVocabulary() {
  try {
    const response = await fetch('/api/vocabulary');
    const data = await response.json();
    renderVocabulary(data);
  } catch (error) {
    console.error("Error fetching vocabulary:", error);
  }
}

function renderVocabulary(words) {
  const container = document.getElementById("vocab-list");
  container.innerHTML = "";
  words.forEach(entry => {
    const item = document.createElement("div");
    item.className = "vocab-entry";
    item.innerHTML = `<strong>${entry.word}</strong> (${entry.phonetic}): ${entry.definition}<br><em>${entry.example}</em>`;
    container.appendChild(item);
  });
}

document.addEventListener("mouseup", function (e) {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    const popup = document.getElementById("vocabPopup");
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();

    popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.display = "block";
  }
});

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("vocabPopup").style.display = "none";
});

document.getElementById("playPronunciation").addEventListener("click", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    const utterance = new SpeechSynthesisUtterance(selectedText);
    speechSynthesis.speak(utterance);
  }
});

