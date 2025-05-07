// ✅ File: src/api/groq.js
export async function generateOutline(topicOrPrompt) {
  const apiKey = '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';
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const isString = typeof topicOrPrompt === 'string';
  const topic = isString ? topicOrPrompt : topicOrPrompt.topic;
  const section = isString ? '' : topicOrPrompt.section || '';

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant that writes detailed, pedagogically sound outlines.',
    },
    {
      role: 'user',
      content: `
You are a college lecturer teaching a course on "${topic}".
Write full textbook-style content for the lecture titled "${topic}".

Output Instructions:
- Format the output as **markdown**.
- Structure it like a detailed textbook chapter, verbose enough for a 60-minute lecture (~5000 words).
- Use **fenced code blocks** with language labels for all code examples. For example:
  \`\`\`java
  public class Hello {
      public static void main(String[] args) {
          System.out.println("Hello, World!");
      }
  }
  \`\`\`
- Explain new technical terms using > quote blocks the first time they appear.
- Do **not** include any extra narration or metadata — output should be markdown content only.
- The markdown will be rendered directly in the frontend — formatting matters.
      `.trim(),
    },
  ];

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Groq API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    console.log("✅ Groq response:", content);
    return content.trim();
  } catch (err) {
    console.error("❌ Error calling Groq API:", err);
    throw err;
  }
}