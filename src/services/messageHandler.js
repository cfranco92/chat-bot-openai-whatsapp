import whatsappService from "./whatsappService.js";
import config from "../config/env.js";
import GREETINGS from "../constants/greetings.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();

      console.log("Message received: ", message);

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }

      await whatsappService.markMessageAsRead(message.id);
    }
  }

  isGreeting(message) {
    return GREETINGS.some((greeting) => message.includes(greeting));
  }

  getSenderInfo(senderInfo) {
    return senderInfo?.profile?.name || senderInfo?.wa_id || "";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderInfo(senderInfo)?.split(" ")?.[0];
    const welcomeMessage =
      `Hola ${name}! Bienvenido a ${config.BUSINESS_NAME}.` +
      "\n¿En qué puedo ayudarte?";
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una opción";
    const buttons = [
      {
        type: "reply",
        reply: { id: "option_1", title: "Agendar" },
      },
      {
        type: "reply",
        reply: { id: "option_2", title: "Consultar" },
      },
      {
        type: "reply",
        reply: { id: "option_3", title: "Ubicación" },
      },
    ];

    await whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }
}

export default new MessageHandler();
