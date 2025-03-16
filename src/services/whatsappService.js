import sendToWhatsApp from "./httpRequest/sendToWhatsApp.js";

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: "whatsapp",
      to,
      text: { body },
      context: {
        message_id: messageId,
      },
    };

    await sendToWhatsApp(data);
  }

  async markMessageAsRead(messageId) {
    const data = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    };

    await sendToWhatsApp(data);
  }

  async sendInteractiveButton(to, body, buttons) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: { buttons },
      },
    };

    await sendToWhatsApp(data);
  }
}

export default new WhatsAppService();
