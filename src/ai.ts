import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processMessage(userMsg: string, context: string) {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful barbershop booking assistant.",
      },
      { role: "user", content: context },
      { role: "user", content: userMsg },
    ],
  });

  return res.choices[0].message?.content;
}
