const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const openaiService = require('../services/openaiService');

class MessageController {
  constructor() {
    this.conversationsDir = path.join(__dirname, '..', 'conversations');
    this.ensureConversationsDir();
  }

  async ensureConversationsDir() {
    try {
      await fs.mkdir(this.conversationsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating conversations directory:', error);
    }
  }

  // Get conversation file path
  getConversationPath(conversationId) {
    return path.join(this.conversationsDir, `${conversationId}.json`);
  }

  // Load conversation from file
  async loadConversation(conversationId) {
    try {
      const filePath = this.getConversationPath(conversationId);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return new conversation
        return {
          id: conversationId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  // Save conversation to file
  async saveConversation(conversation) {
    try {
      const filePath = this.getConversationPath(conversation.id);
      conversation.updatedAt = new Date().toISOString();
      await fs.writeFile(filePath, JSON.stringify(conversation, null, 2));
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  // Send message and get AI response
  async sendMessage(req, res) {
    try {
      const { message, conversationId = uuidv4() } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Message is required and must be a non-empty string'
        });
      }

      // Load existing conversation
      const conversation = await this.loadConversation(conversationId);

      // Add user message
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: message.trim(),
        timestamp: new Date().toISOString()
      };
      conversation.messages.push(userMessage);

      // Prepare messages for AI (last 10 messages to maintain context)
      const recentMessages = conversation.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Get AI response
      const aiResult = await openaiService.generateResponse(recentMessages);

      // Add AI message
      const aiMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResult.response,
        timestamp: new Date().toISOString(),
        usage: aiResult.usage
      };
      conversation.messages.push(aiMessage);

      // Save conversation
      await this.saveConversation(conversation);

      res.json({
        conversationId: conversation.id,
        message: aiMessage,
        totalMessages: conversation.messages.length
      });

    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({
        error: 'Failed to process message',
        details: error.message
      });
    }
  }

  // Get conversation history
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          error: 'Conversation ID is required'
        });
      }

      const conversation = await this.loadConversation(conversationId);

      res.json({
        conversation: {
          id: conversation.id,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messageCount: conversation.messages.length
        }
      });

    } catch (error) {
      console.error('Error getting conversation:', error);
      res.status(500).json({
        error: 'Failed to retrieve conversation',
        details: error.message
      });
    }
  }

  // Get conversation starters
  async getConversationStarters(req, res) {
    try {
      const { topic } = req.query;
      const starters = await openaiService.generateConversationStarters(topic);

      res.json({
        starters,
        topic: topic || 'general'
      });

    } catch (error) {
      console.error('Error getting conversation starters:', error);
      res.status(500).json({
        error: 'Failed to generate conversation starters',
        details: error.message
      });
    }
  }

  // Look up word definition
  async lookupWord(req, res) {
    try {
      const { word } = req.params;

      if (!word || word.trim().length === 0) {
        return res.status(400).json({
          error: 'Word parameter is required'
        });
      }

      const result = await openaiService.lookupWord(word.trim());

      res.json(result);

    } catch (error) {
      console.error('Error looking up word:', error);
      res.status(500).json({
        error: 'Failed to lookup word',
        details: error.message
      });
    }
  }

  // Correct grammar
  async correctGrammar(req, res) {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: 'Text is required for grammar correction'
        });
      }

      const correction = await openaiService.correctGrammar(text.trim());

      res.json({
        originalText: text.trim(),
        correction
      });

    } catch (error) {
      console.error('Error correcting grammar:', error);
      res.status(500).json({
        error: 'Failed to correct grammar',
        details: error.message
      });
    }
  }

  // Analyze language level
  async analyzeLanguageLevel(req, res) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          error: 'Conversation ID is required'
        });
      }

      const conversation = await this.loadConversation(conversationId);
      
      if (conversation.messages.length === 0) {
        return res.json({
          analysis: 'No messages to analyze yet. Start chatting to get language level feedback!'
        });
      }

      const userMessages = conversation.messages.filter(msg => msg.role === 'user');
      
      if (userMessages.length === 0) {
        return res.json({
          analysis: 'No user messages to analyze yet.'
        });
      }

      const analysis = await openaiService.analyzeLanguageLevel(userMessages);

      res.json({
        conversationId,
        messageCount: userMessages.length,
        analysis
      });

    } catch (error) {
      console.error('Error analyzing language level:', error);
      res.status(500).json({
        error: 'Failed to analyze language level',
        details: error.message
      });
    }
  }

  // Get all conversations (list)
  async getAllConversations(req, res) {
    try {
      const files = await fs.readdir(this.conversationsDir);
      const conversations = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const conversationId = file.replace('.json', '');
            const conversation = await this.loadConversation(conversationId);
            conversations.push({
              id: conversation.id,
              createdAt: conversation.createdAt,
              updatedAt: conversation.updatedAt,
              messageCount: conversation.messages.length,
              lastMessage: conversation.messages.length > 0 
                ? conversation.messages[conversation.messages.length - 1].content.substring(0, 100) + '...'
                : 'No messages'
            });
          } catch (error) {
            console.error(`Error loading conversation ${file}:`, error);
          }
        }
      }

      // Sort by updatedAt (most recent first)
      conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      res.json({
        conversations,
        totalCount: conversations.length
      });

    } catch (error) {
      console.error('Error getting all conversations:', error);
      res.status(500).json({
        error: 'Failed to retrieve conversations',
        details: error.message
      });
    }
  }

  // Delete conversation
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({
          error: 'Conversation ID is required'
        });
      }

      const filePath = this.getConversationPath(conversationId);
      
      try {
        await fs.unlink(filePath);
        res.json({
          message: 'Conversation deleted successfully',
          conversationId
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          return res.status(404).json({
            error: 'Conversation not found'
          });
        }
        throw error;
      }

    } catch (error) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({
        error: 'Failed to delete conversation',
        details: error.message
      });
    }
  }
}

module.exports = new MessageController();