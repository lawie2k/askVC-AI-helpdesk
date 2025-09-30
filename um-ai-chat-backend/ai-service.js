const ModelClient = require("@azure-rest/ai-inference").default;
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");

class AIService {
  constructor() {
    this.client = null;
    this.model = process.env.MODEL_ID || "openai/gpt-4o-mini";
    this.endpoint = "https://models.github.ai/inference";
    this.initialize();
  }

  initialize() {
    const token = process.env.GITHUB_TOKEN;
    
    try {
      if (token && typeof token === 'string' && token.trim().length > 0) {
        this.client = ModelClient(this.endpoint, new AzureKeyCredential(token));
        console.log('✅ GitHub AI client initialized');
      } else {
        console.warn('⚠️  GITHUB_TOKEN not set. AI features disabled.');
      }
    } catch (e) {
      console.warn('⚠️  Failed to initialize AI client. AI features disabled.', String(e));
      this.client = null;
    }
  }

  async generateResponse(systemPrompt, userQuestion) {
    if (!this.client) {
      throw new Error('AI client not initialized');
    }

    // Helper to enforce timeout on AI call
    const withTimeout = (promise, ms) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), ms)),
      ]);
    };

    try {
      const response = await withTimeout(
        this.client.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userQuestion },
            ],
            model: this.model,
            max_tokens: 300,
            temperature: 0.5,
          },
        }),
        Number(process.env.AI_TIMEOUT_MS || 8000)
      );

      if (isUnexpected(response)) {
        throw response.body.error;
      }

      return response.body.choices[0].message.content;
    } catch (error) {
      if (error.message === "AI_TIMEOUT") {
        throw new Error("AI request timed out");
      }
      throw error;
    }
  }

  isAvailable() {
    return this.client !== null;
  }
}

module.exports = AIService;
