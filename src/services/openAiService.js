import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const openAiService = async (message) => {
  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: config.ROLE_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "gpt-4o",
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI service:", error);
    throw error;
  }
};

export default openAiService;
