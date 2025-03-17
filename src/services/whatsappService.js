import sendToWhatsApp from "./httpRequest/sendToWhatsApp.js";

export class WhatsAppService {
  constructor(sendToWhatsAppFn = sendToWhatsApp) {
    this.sendToWhatsApp = sendToWhatsAppFn;
  }

  async sendMessage(to, body, messageId) {
    let context;
    if (messageId) {
      context = {
        message_id: messageId,
      };
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      text: { body },
      ...(context && { context }),
    };

    return this.sendToWhatsApp(data);
  }

  async markMessageAsRead(messageId) {
    const data = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    };

    return this.sendToWhatsApp(data);
  }

  async sendInteractiveButton(to, body, buttons) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: buttons.map((button) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      },
    };

    return this.sendToWhatsApp(data);
  }

  async sendMediaMessage({ to, type, mediaUrl, caption }) {
    const mediaObject = {};
    switch (type) {
      case "image":
        mediaObject.image = { link: mediaUrl, ...(caption && { caption }) };
        break;
      case "audio":
        mediaObject.audio = { link: mediaUrl };
        break;
      case "video":
        mediaObject.video = { link: mediaUrl, ...(caption && { caption }) };
        break;
      case "document":
        mediaObject.document = {
          link: mediaUrl,
          ...(caption && { caption }),
          filename: "medpet.pdf",
        };
        break;
      default:
        throw new Error("Unsupported media type");
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      type,
      ...mediaObject,
    };

    return this.sendToWhatsApp(data);
  }

  async sendLocation(to, location) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "location",
      location,
    };

    return this.sendToWhatsApp(data);
  }
}

export default new WhatsAppService();
