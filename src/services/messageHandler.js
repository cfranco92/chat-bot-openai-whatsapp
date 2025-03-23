import whatsappServiceSingleton from "./whatsappService.js";
import config from "../config/env.js";
import i18next from "../i18n/index.js";
import appendToSheet from "./googleSheetsService.js";
import openAiService from "./openAiService.js";

export class MessageHandler {
  constructor(whatsappService = whatsappServiceSingleton) {
    this.appointmentState = {};
    this.whatsappService = whatsappService;
    this.assistantState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    if (message.type === "text") {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else if (incomingMessage === "media") {
        await this.sendMedia(message.from);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else if (this.assistantState[message.from]) {
        await this.handleAssistantFlow(message.from, incomingMessage);
      } else {
        await this.handleMenuOption(message.from, incomingMessage);
      }

      await this.whatsappService.markMessageAsRead(message.id);
    } else if (message.type === "interactive") {
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
      await this.whatsappService.markMessageAsRead(message.id);
    }
  }

  isGreeting(message) {
    const translatedGreetings = i18next.t("greetings", { returnObjects: true });
    const greetings = Object.values(translatedGreetings);
    return greetings.some((greeting) =>
      message.toLowerCase().includes(greeting.toLowerCase())
    );
  }

  getSenderInfo(senderInfo) {
    return senderInfo?.profile?.name || senderInfo?.wa_id || "";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderInfo(senderInfo)?.split(" ")?.[0];
    const welcomeMessage = `${i18next.t("welcome.greeting", {
      name,
      businessName: config.BUSINESS_NAME,
    })}\n${i18next.t("welcome.help")}`;
    await this.whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to, errorMessage) {
    const menuMessage = i18next.t("menu.choose");
    const buttons = [
      {
        id: "option_1",
        title: i18next.t("menu.schedule"),
      },
      {
        id: "option_2",
        title: i18next.t("menu.consult"),
      },
      {
        id: "option_3",
        title: i18next.t("menu.location"),
      },
    ];

    if (errorMessage) {
      await this.whatsappService.sendMessage(to, errorMessage);
    }
    await this.whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "option_1":
        this.appointmentState[to] = { step: "name" };
        console.log(
          "Starting appointment flow. Initial state:",
          this.appointmentState[to]
        );
        response = i18next.t("appointment.enterName");
        break;
      case "option_2":
        this.assistantState[to] = { step: "question" };
        response = i18next.t("consult.prompt");
        break;
      case "option_3":
        await this.sendLocation(to);
        return;
      case "option_4":
        await this.sendWelcomeMenu(to);
        return;
      case "option_5":
        this.assistantState[to] = { step: "question" };
        response = i18next.t("consult.prompt");
        break;
      case "option_6":
        response = i18next.t("contact.message");
        await this.sendContact(to);
        return;
      default:
        console.log("Invalid menu option received:", option);
        // await this.sendWelcomeMenu(to, i18next.t("errors.userMenuOption"));
        break;
    }

    await this.whatsappService.sendMessage(to, response);
  }

  async sendLocation(to) {
    const location = {
      latitude: 19.4326,
      longitude: -99.1332,
      name: i18next.t("location.name"),
      address: i18next.t("location.address"),
    };

    await this.whatsappService.sendLocation(to, location);
  }

  async sendMedia(to) {
    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
    // const caption = i18next.t("media.welcome");
    // const type = 'audio';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = i18next.t("media.image");
    // const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = i18next.t("media.video");
    // const type = 'video';

    const mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-file.pdf";
    const caption = i18next.t("media.document");
    const type = "document";

    await this.whatsappService.sendMediaMessage({
      to,
      type,
      mediaUrl,
      caption,
    });
  }

  completeAppointment(to) {
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.name,
      appointment.petName,
      appointment.petType,
      appointment.reason,
      new Date().toISOString(),
    ];

    appendToSheet(userData);

    return `${i18next.t("appointment.summary.title", {
      name: appointment.name,
    })}

${i18next.t("appointment.summary.name", { name: appointment.name })}
${i18next.t("appointment.summary.petName", { petName: appointment.petName })}
${i18next.t("appointment.summary.petType", { petType: appointment.petType })}
${i18next.t("appointment.summary.reason", { reason: appointment.reason })}

${i18next.t("appointment.summary.followUp")}`;
  }

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    console.log("Starting appointment flow with state:", state);
    let response;

    if (!state) {
      console.error("No appointment state found for:", to);
      return;
    }

    switch (state.step) {
      case "name":
        state.name = message;
        state.step = "petName";
        response = i18next.t("appointment.petName");
        break;
      case "petName":
        state.petName = message;
        state.step = "petType";
        response = i18next.t("appointment.petType");
        break;
      case "petType":
        state.petType = message;
        state.step = "reason";
        response = i18next.t("appointment.reason");
        break;
      case "reason":
        state.reason = message;
        response = this.completeAppointment(to);
        delete this.appointmentState[to];
        break;
      default:
        console.error("Invalid appointment state:", state.step);
        delete this.appointmentState[to];
        throw new Error("Invalid appointment state");
    }

    console.log("Updated state:", this.appointmentState[to]);
    await this.whatsappService.sendMessage(to, response);
  }

  async handleAssistantFlow(to, message) {
    const state = this.assistantState[to];
    console.log("Starting assistant flow with state:", state);
    let response;

    const menuMessage = i18next.t("consult.feedback");
    const buttons = [
      { id: "option_4", title: i18next.t("consult.thankYou") },
      { id: "option_5", title: i18next.t("consult.anotherQuestion") },
      { id: "option_6", title: i18next.t("consult.emergency") },
    ];

    if (state.step === "question") {
      response = await openAiService(message);
    }

    delete this.assistantState[to];
    await this.whatsappService.sendMessage(to, response);
    await this.whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }

  async sendContact(to) {
    const contactDetails = i18next.t("contact.details", {
      returnObjects: true,
    });
    const contact = {
      addresses: [
        {
          street: contactDetails.street,
          city: contactDetails.city,
          state: contactDetails.state,
          zip: contactDetails.zip,
          country: contactDetails.country,
          country_code: "PA",
          type: "WORK",
        },
      ],
      emails: [
        {
          email: contactDetails.email,
          type: "WORK",
        },
      ],
      name: {
        formatted_name: contactDetails.name,
        first_name: contactDetails.company,
        last_name: contactDetails.department,
        middle_name: "",
        suffix: "",
        prefix: "",
      },
      org: {
        company: contactDetails.company,
        department: contactDetails.department,
        title: contactDetails.title,
      },
      phones: [
        {
          phone: contactDetails.phone,
          wa_id: "1234567890",
          type: "WORK",
        },
      ],
      urls: [
        {
          url: contactDetails.website,
          type: "WORK",
        },
      ],
    };

    return this.whatsappService.sendContactMessage(to, contact);
  }
}

export default new MessageHandler();
