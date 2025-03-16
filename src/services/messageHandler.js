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
      `Hello ${name}! Welcome to ${config.BUSINESS_NAME}.` +
      "\nHow can I help you today?";
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Choose an option";
    const buttons = [
      {
        type: "reply",
        reply: { id: "option_1", title: "Schedule" },
      },
      {
        type: "reply",
        reply: { id: "option_2", title: "Consult" },
      },
      {
        type: "reply",
        reply: { id: "option_3", title: "Location" },
      },
    ];

    await whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "option_1":
        this.appointmentState[to] = { step: "name" };
        response = "Please enter your name:";
        break;
      case "option_2":
        response = "What would you like to consult about?";
        break;
      case "option_3":
        await this.sendLocation(to);
        return;
      default:
        response =
          "Sorry, I didn't understand your selection. Please choose one of the menu options";
        break;
    }

    await whatsappService.sendMessage(to, response);
  }

  async sendLocation(to) {
    const location = {
      latitude: 19.4326,
      longitude: -99.1332,
      name: "MedPet Veterinary",
      address: "Historic Center, Mexico City",
    };

    await whatsappService.sendLocation(to, location);
  }

  async sendMedia(to) {
    const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
    const caption = "Welcome";
    const type = "audio";

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = 'This is an Image!';
    // const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = 'This is a video!';
    // const type = 'video';

    // const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-file.pdf";
    // const caption = "This is a PDF!";
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
        response = "Thank you. Now, what's your pet's name?";
        break;
      case "petName":
        state.petName = message;
        state.step = "petType";
        response =
          "Perfect. Now, what type of pet is it? (for example: dog, cat, ferret, etc.)";
        break;
      case "petType":
        state.petType = message;
        state.step = "reason";
        response =
          "What's the reason for the appointment? (for example: vaccination, deworming, etc.)";
        break;
      case "reason":
        state.reason = message;
        response = "Thank you for your preference. Your appointment has been scheduled.";
        break;
    }

    await whatsappService.sendMessage(to, response);
  }
}

export default new MessageHandler();
