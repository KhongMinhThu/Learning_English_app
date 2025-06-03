const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// Message routes
router.post('/messages', messageController.sendMessage.bind(messageController));
router.get('/conversations/:conversationId', messageController.getConversation.bind(messageController));
router.get('/conversations', messageController.getAllConversations.bind(messageController));
router.delete('/conversations/:conversationId', messageController.deleteConversation.bind(messageController));

// Learning assistance routes
router.get('/conversation-starters', messageController.getConversationStarters.bind(messageController));
router.get('/dictionary/:word', messageController.lookupWord.bind(messageController));
router.post('/grammar-check', messageController.correctGrammar.bind(messageController));
router.get('/analyze/:conversationId', messageController.analyzeLanguageLevel.bind(messageController));

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'English Learning Conversation API',
    version: '1.0.0',
    endpoints: {
      messages: {
        'POST /api/messages': 'Send a message and get AI response',
        'GET /api/conversations/:id': 'Get conversation history',
        'GET /api/conversations': 'Get all conversations',
        'DELETE /api/conversations/:id': 'Delete a conversation'
      },
      learning: {
        'GET /api/conversation-starters': 'Get conversation starter suggestions',
        'GET /api/dictionary/:word': 'Look up word definition',
        'POST /api/grammar-check': 'Check grammar and get corrections',
        'GET /api/analyze/:conversationId': 'Analyze language level'
      }
    }
  });
});

module.exports = router;