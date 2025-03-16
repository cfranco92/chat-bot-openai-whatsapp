import whatsappService from "./whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();

      console.log("Message received: ", message);

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }

      await whatsappService.markMessageAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hi", "hello", "hey", "greetings", "greet"];
    return greetings.some((greeting) => message.includes(greeting));
  }

  async sendWelcomeMessage(to, messageId) {
    const welcomeMessage =
      `Hola! Bienvenido a nuestro servicio de Veterinaria online.` +
      "¿En qué puedo ayudarte?";
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
}

export default new MessageHandler();
