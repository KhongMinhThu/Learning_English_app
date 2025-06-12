// Chat.js - Handles sending user input and receiving AI replies

async function sendMessage(message) {
  try {
    showLoadingSpinner();
    /*
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    displayResponse(data.reply);
    */
    const reply = "This is a mock reply from AI.";
    displayResponse(reply);
  } catch (error) {
    showError("Unable to reach server. Please try again later.");
  } finally {
    hideLoadingSpinner();
  }
}

function displayResponse(text) {
  console.log("AI:", text);
}

function showLoadingSpinner() {}
function hideLoadingSpinner() {}
function showError(msg) {
  console.error(msg);
}
