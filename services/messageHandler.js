import whatsappService from "./whatsappService.js";

class MessageHandler {
  async handleIncomingMesage(message) {
    if (message.type === "text") {
      const response = `Echo: ${message.text.body}`;
      await whatsappService.sendMessage(message.from, response, message.id);
      await whatsappService.markMessageAsRead(message.id);
    }
  }
}

export default new MessageHandler();
