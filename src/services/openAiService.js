import OpenAI from "openai";
import config from "../config/env.js";

const openAiService = async (message) => {
  try {
    if (!config.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const client = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
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
      model: config.OPENAI_MODEL,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI service:", error);
    throw error;
  }
};

export default openAiService;
