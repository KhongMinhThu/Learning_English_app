const OpenAI = require('openai');
const axios = require('axios');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.oxfordAppId = process.env.OXFORD_APP_ID;
    this.oxfordAppKey = process.env.OXFORD_APP_KEY;
  }

  // Generate conversation response using OpenAI GPT
  async generateResponse(messages, conversationContext = null) {
    try {
      const systemPrompt = `You are an English conversation tutor. Your role is to:
1. Engage in meaningful conversations to help users practice English
2. Correct grammar mistakes gently and naturally
3. Suggest better word choices when appropriate
4. Ask follow-up questions to keep the conversation flowing
5. Provide pronunciation tips when needed
6. Be encouraging and supportive
7. Match the user's language level appropriately

Keep responses conversational and natural. Don't be overly formal or robotic.
${conversationContext ? `Context: ${conversationContext}` : ''}`;

      const conversationMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversationMessages,
        max_tokens: 300,
        temperature: 0.7,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      });

      return {
        response: completion.choices[0].message.content,
        usage: completion.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI service error: ${error.message}`);
    }
  }

  // Generate conversation starters
  async generateConversationStarters(topic = null) {
    try {
      const prompt = topic 
        ? `Generate 3 conversation starter questions about ${topic} for English learning practice. Make them engaging and appropriate for intermediate learners.`
        : `Generate 3 general conversation starter questions for English learning practice. Make them engaging and appropriate for intermediate learners.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.8
      });

      const starters = completion.choices[0].message.content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return starters;
    } catch (error) {
      console.error('Error generating conversation starters:', error);
      return [
        "What's your favorite hobby and why do you enjoy it?",
        "Tell me about a memorable trip you've taken recently.",
        "What's something new you've learned this week?"
      ];
    }
  }

  // Analyze user's English level
  async analyzeLanguageLevel(userMessages) {
    try {
      const recentMessages = userMessages.slice(-5).map(msg => msg.content).join(' ');
      
      const prompt = `Analyze the English language level of this text and provide a brief assessment:
"${recentMessages}"

Rate the level as: Beginner, Intermediate, or Advanced
Provide 2-3 specific suggestions for improvement.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing language level:', error);
      return "Keep practicing! Focus on using varied vocabulary and complete sentences.";
    }
  }

  // Look up word definition using Oxford Dictionary API
  async lookupWord(word) {
    try {
      if (!this.oxfordAppId || !this.oxfordAppKey) {
        throw new Error('Oxford Dictionary API credentials not configured');
      }

      const url = `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word.toLowerCase()}`;
      
      const response = await axios.get(url, {
        headers: {
          'app_id': this.oxfordAppId,
          'app_key': this.oxfordAppKey
        }
      });

      const lexicalEntries = response.data.results[0]?.lexicalEntries || [];
      const definitions = [];
      const pronunciations = [];

      lexicalEntries.forEach(entry => {
        // Get pronunciations
        if (entry.pronunciations) {
          entry.pronunciations.forEach(pron => {
            if (pron.phoneticSpelling) {
              pronunciations.push({
                phoneticSpelling: pron.phoneticSpelling,
                audioFile: pron.audioFile
              });
            }
          });
        }

        // Get definitions
        entry.entries?.forEach(subEntry => {
          subEntry.senses?.forEach(sense => {
            if (sense.definitions) {
              sense.definitions.forEach(def => {
                definitions.push({
                  partOfSpeech: entry.lexicalCategory?.text || 'unknown',
                  definition: def,
                  examples: sense.examples?.map(ex => ex.text) || []
                });
              });
            }
          });
        });
      });

      return {
        word: word,
        definitions: definitions.slice(0, 3), // Limit to 3 definitions
        pronunciations: pronunciations.slice(0, 2) // Limit to 2 pronunciations
      };

    } catch (error) {
      console.error('Oxford Dictionary API Error:', error);
      
      // Fallback: Generate definition using OpenAI
      try {
        const prompt = `Define the English word "${word}" in simple terms. Include:
1. Part of speech
2. Simple definition
3. Example sentence
Format as JSON.`;

        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.3
        });

        return {
          word: word,
          definitions: [{
            partOfSpeech: 'unknown',
            definition: completion.choices[0].message.content,
            examples: []
          }],
          pronunciations: [],
          source: 'AI generated'
        };
      } catch (fallbackError) {
        throw new Error(`Dictionary lookup failed: ${error.message}`);
      }
    }
  }

  // Grammar correction
  async correctGrammar(text) {
    try {
      const prompt = `Please correct any grammar mistakes in this text and explain the corrections:
"${text}"

If there are no mistakes, just say "No corrections needed."
If there are mistakes, provide the corrected version and briefly explain what was changed.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Grammar correction error:', error);
      throw new Error(`Grammar correction failed: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();