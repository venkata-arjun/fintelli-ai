import Groq from "groq-sdk";

export const askAI = async (messages, systemPrompt = "") => {
  // Read keys inside the function so dotenv has already loaded them
  const keys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean);

  console.log("[Groq] Keys available:", keys.length);

  if (keys.length === 0) {
    throw new Error(
      "No Groq API keys found. Check GROQ_API_KEY_1 / _2 / _3 in your .env",
    );
  }

  let lastError;

  for (let i = 0; i < keys.length; i++) {
    try {
      console.log(`[Groq] Trying key ${i + 1}/${keys.length}`);

      const groq = new Groq({ apiKey: keys[i] });

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          ...messages,
        ],
      });

      const reply = completion.choices[0]?.message?.content;

      if (!reply) throw new Error("Empty response from Groq");

      return reply;
    } catch (err) {
      lastError = err;
      console.warn(`[Groq] Key ${i + 1} failed:`, err.status, err.message);
    }
  }

  throw lastError;
};
