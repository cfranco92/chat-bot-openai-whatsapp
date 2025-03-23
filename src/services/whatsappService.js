import sendToWhatsApp from "./httpRequest/sendToWhatsApp.js";

export class WhatsAppService {
  constructor(sendToWhatsAppFn = sendToWhatsApp) {
    this.sendToWhatsApp = sendToWhatsAppFn;
  }

  async sendMessage(to, text, messageId) {
    if (!to || typeof to !== "string") {
      throw new Error("Invalid phone number format");
    }

    if (!text || text.trim() === "") {
      throw new Error("Message text cannot be empty");
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    };

    if (messageId) {
      data.context = { message_id: messageId };
    }

    return this.sendToWhatsApp(data);
  }

  async markMessageAsRead(messageId) {
    if (!messageId) {
      throw new Error("Message ID is required");
    }

    const data = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    };

    return this.sendToWhatsApp(data);
  }

  async sendInteractiveButton(to, text, buttons) {
    if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
      throw new Error("At least one button is required");
    }

    if (buttons.length > 3) {
      throw new Error("Maximum of 3 buttons allowed");
    }

    const hasInvalidButton = buttons.some((button) => !button.id || !button.title || button.title.length > 20);

    if (hasInvalidButton) {
      throw new Error("Each button must have an id and title, and title cannot exceed 20 characters");
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text },
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

  async sendMediaMessage(params) {
    const { to, type, mediaUrl, caption, filename } = params;

    if (!to || !type || !mediaUrl) {
      throw new Error("Missing required parameters");
    }

    if (!mediaUrl.match(/^https?:\/\/.+/)) {
      throw new Error("Invalid media URL");
    }

    const supportedTypes = ["image", "video", "audio", "document"];
    if (!supportedTypes.includes(type)) {
      throw new Error("Unsupported media type");
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      type,
    };

    switch (type) {
      case "image":
        data.image = {
          link: mediaUrl,
          ...(caption && { caption }),
        };
        break;
      case "video":
        data.video = {
          link: mediaUrl,
          ...(caption && { caption }),
        };
        break;
      case "audio":
        data.audio = {
          link: mediaUrl,
        };
        break;
      case "document":
        data.document = {
          link: mediaUrl,
          filename: filename || "medpet.pdf",
        };
        break;
      default:
        throw new Error("Unsupported media type");
    }

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

  async sendContactMessage(to, contact) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "contacts",
      contacts: [contact],
    };

    return this.sendToWhatsApp(data);
  }
}

export default new WhatsAppService();
