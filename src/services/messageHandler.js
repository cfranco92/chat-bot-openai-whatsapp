import whatsappService from "./whatsappService.js";
import config from "../config/env.js";
import GREETINGS from "../constants/greetings.js";
import i18next from "../i18n/index.js";

class MessageHandler {
  constructor() {
    this.appointmentState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();

      console.log("Message received:", message);

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
      i18next.t('welcome.greeting', { name, businessName: config.BUSINESS_NAME }) +
      "\n" + i18next.t('welcome.help');
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = i18next.t('menu.choose');
    const buttons = [
      {
        type: "reply",
        reply: { id: "option_1", title: i18next.t('menu.schedule') },
      },
      {
        type: "reply",
        reply: { id: "option_2", title: i18next.t('menu.consult') },
      },
      {
        type: "reply",
        reply: { id: "option_3", title: i18next.t('menu.location') },
      },
    ];

    await whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "option_1":
        this.appointmentState[to] = { step: "name" };
        response = i18next.t('appointment.enterName');
        break;
      case "option_2":
        response = i18next.t('consult.prompt');
        break;
      case "option_3":
        await this.sendLocation(to);
        return;
      default:
        console.log("Invalid menu option received:", option);
        response = i18next.t('errors.userMenuOption');
        break;
    }

    await whatsappService.sendMessage(to, response);
  }

  async sendLocation(to) {
    const location = {
      latitude: 19.4326,
      longitude: -99.1332,
      name: i18next.t('location.name'),
      address: i18next.t('location.address')
    };

    await whatsappService.sendLocation(to, location);
  }

  async sendMedia(to) {
    const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";
    const caption = i18next.t('media.welcome');
    const type = "audio";

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
        response = i18next.t('appointment.petName');
        break;
      case "petName":
        state.petName = message;
        state.step = "petType";
        response = i18next.t('appointment.petType');
        break;
      case "petType":
        state.petType = message;
        state.step = "reason";
        response = i18next.t('appointment.reason');
        break;
      case "reason":
        state.reason = message;
        response = i18next.t('appointment.confirmation');
        delete this.appointmentState[to];
        break;
      default:
        console.error("Invalid appointment state:", state.step);
        delete this.appointmentState[to];
        throw new Error("Invalid appointment state");
    }

    await whatsappService.sendMessage(to, response);
  }
}

export default new MessageHandler();
