const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();
const path = require('path');

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../serviceAccount.json');

async function summarizePost(url) {
  const prompt = `Summarize the following automotive article in 3-4 concise lines. Assume the reader already knows it's about the specific article, 
so avoid phrases like "this article" or "the piece." Focus on the main subject, 
setting, and any standout themes or details. Keep the tone neutral and informative.: "${url}"`;

  try {
    const vertex_ai = new VertexAI({ project: process.env.GCP_PROJECT_ID, location: 'us-central1' });
    const generativeModel = vertex_ai.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 120,
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;
    return text.trim();
  } catch (error) {
    console.error('❌ Vertex AI error:', error);
    return null;
  }
}

// Self-test block
if (require.main === module) {
  const testUrl = 'https://www.speedhunters.com/2025/03/exploring-japans-wazuka-microcar-museum/';
  summarizePost(testUrl).then(summary => {
    if (summary) {
      console.log('\n🧠 Summary:\n', summary);
    } else {
      console.log('⚠️ Failed to generate summary.');
    }
  });
}

module.exports = { summarizePost };