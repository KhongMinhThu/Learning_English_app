// History.js - Loads and displays past chat sessions

async function fetchChatHistory() {
  try {
    const response = await fetch('/api/history');
    const history = await response.json();
    renderChatHistory(history);
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }
}

function renderChatHistory(historyList) {
  const container = document.getElementById("history-list");
  container.innerHTML = "";
  historyList.forEach(session => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerText = `Chat at ${new Date(session.timestamp).toLocaleString()}`;
    container.appendChild(item);
  });
}
