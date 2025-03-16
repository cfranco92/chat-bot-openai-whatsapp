import whatsappService from "./whatsappService.js";
import config from "../config/env.js";
import GREETINGS from "../constants/greetings.js";

class MessageHandler {
  constructor() {
    this.appointmentState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();

      console.log("Message received: ", message);

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if (incomingMessage === "media") {
        await this.sendMedia(message.from);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }

      await whatsappService.markMessageAsRead(message.id);
    } else if (message.type === "interactive") {
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
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

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "option_1":
        this.appointmentState[to] = { step: "name" };
        response = "Por favor, ingresa tu nombre:";
        break;
      case "option_2":
        response = "Realiza tu consulta";
        break;
      case "option_3":
        await this.sendLocation(to);
        return;
      default:
        response =
          "Lo siento, no entendí tu selección. Por favor, elige una de las opciones del menú";
        break;
    }

    await whatsappService.sendMessage(to, response);
  }

  async sendLocation(to) {
    const location = {
      latitude: 19.4326,
      longitude: -99.1332,
      name: "MedPet Veterinaria",
      address: "Centro Histórico, CDMX",
    };

    await whatsappService.sendLocation(to, location);
  }

  async sendMedia(to) {
    const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
    const caption = "Bienvenida";
    const type = "audio";

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = '¡Esto es una Imagen!';
    // const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = '¡Esto es una video!';
    // const type = 'video';

    // const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-file.pdf";
    // const caption = "¡Esto es un PDF!";
    // const type = "document";
    await whatsappService.sendMediaMessage({
      to,
      type,
      mediaUrl,
      caption,
    });
  }

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
      case "name":
        state.name = message;
        state.step = "petName";
        response = "Gracias. Ahora, ¿cuál es el nombre de tu mascota?";
        break;
      case "petName":
        state.petName = message;
        state.step = "petType";
        response =
          "Perfecto. Ahora, ¿qué tipo de mascota es? (por ejemplo: perro, gato, huron, etc.)";
        break;
      case "petType":
        state.petType = message;
        state.step = "reason";
        response =
          "¿Cuál es el motivo de la cita? (por ejemplo: vacunación, desparasitación, etc.)";
        break;
      case "reason":
        state.reason = message;
        response = "Gracias por tu preferencia. Tu cita ha sido agendada.";
        break;
    }

    await whatsappService.sendMessage(to, response);
  }
}

export default new MessageHandler();
