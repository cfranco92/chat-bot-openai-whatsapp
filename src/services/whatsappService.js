import sendToWhatsApp from "./httpRequest/sendToWhatsApp.js";

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    let context;
    if (messageId) {
      context = {
        ...context,
        message_id: messageId,
      };
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      text: { body },
      context,
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

  async sendMediaMessage({ to, type, mediaUrl, caption }) {
    const mediaObject = {};
    switch (type) {
      case "image":
        mediaObject.image = { link: mediaUrl, caption };
        break;
      case "audio":
        mediaObject.audio = { link: mediaUrl };
        break;
      case "video":
        mediaObject.video = { link: mediaUrl, caption };
        break;
      case "document":
        mediaObject.document = {
          link: mediaUrl,
          caption,
          filename: "medpet.pdf",
        };
        break;
      default:
        throw new Error("Tipo de media no soportado");
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      type,
      ...mediaObject,
    };

    await sendToWhatsApp(data);
  }

  async sendLocation(to, location) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "location",
      location
    };

    await sendToWhatsApp(data);
  }
}

export default new WhatsAppService();
