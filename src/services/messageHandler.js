import whatsappServiceSingleton from "./whatsappService.js";
import config from "../config/env.js";
import i18next from "../i18n/index.js";
import appendToSheetServiceSingleton from "./googleSheetsService.js";
import openAiServiceSingleton from "./openAiService.js";

export class MessageHandler {
  constructor(
    whatsappService = whatsappServiceSingleton,
    openAiService = openAiServiceSingleton,
    appendToSheet = appendToSheetServiceSingleton
  ) {
    this.appointmentState = {};
    this.assistantState = {};
    this.whatsappService = whatsappService;
    this.openAiService = openAiService;
    this.appendToSheetService = appendToSheet;
  }

  async handleIncomingMessage(message, senderInfo) {
    // Validate message
    if (!message) {
      throw new Error("Invalid message object");
    }

    if (!message.type || !message.from || !message.id) {
      throw new Error("Missing required message properties");
    }

    if (message.type === "text") {
      if (!message.text || !message.text.body) {
        throw new Error("Invalid text message format");
      }

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
      if (!message.interactive || !message.interactive.button_reply) {
        throw new Error("Invalid interactive message format");
      }

      const option = message.interactive.button_reply.id;
      await this.handleMenuOption(message.from, option);
      await this.whatsappService.markMessageAsRead(message.id);
    } else if (message.type === "location") {
      await this.whatsappService.markMessageAsRead(message.id);
      await this.whatsappService.sendMessage(
        message.from,
        i18next.t("messages.locationReceived"),
        message.id,
      );
    } else if (message.type === "contacts") {
      await this.whatsappService.markMessageAsRead(message.id);
      await this.whatsappService.sendMessage(
        message.from,
        i18next.t("messages.contactReceived"),
        message.id,
      );
    } else if (message.type === "document") {
      await this.whatsappService.markMessageAsRead(message.id);
      await this.whatsappService.sendMessage(
        message.from,
        i18next.t("messages.documentReceived"),
        message.id,
      );
    } else if (message.type === "image") {
      await this.whatsappService.markMessageAsRead(message.id);
      await this.whatsappService.sendMessage(
        message.from,
        i18next.t("messages.imageReceived"),
        message.id,
      );
    } else {
      await this.whatsappService.markMessageAsRead(message.id);
      throw new Error("errors.unsupportedMessageType");
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
        response = i18next.t("location.message");
        await this.sendLocation(to);
        break;
      case "option_4":
        await this.sendWelcomeMenu(to);
        break;
      case "option_5":
        this.assistantState[to] = { step: "question" };
        response = i18next.t("consult.prompt");
        break;
      case "option_6":
        response = i18next.t("consult.emergencyContact");
        await this.sendContact(to);
        break;
      default:
        console.log("Invalid menu option received:", option);
        await this.sendWelcomeMenu(to, i18next.t("errors.userMenuOption"));
        break;
    }

    if (response) {
      await this.whatsappService.sendMessage(to, response);
    }
  }

  async sendMedia(to) {
    // Example media URLs for different types of content
    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
    // const caption = i18next.t("media.welcome");
    // const type = 'audio';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = i18next.t("media.image");
    // const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = i18next.t("media.video");
    // const type = 'video';

    // Currently using document type as default
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

  async completeAppointment(to) {
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

    await this.appendToSheetService(userData);

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
    // Log the current state for debugging purposes
    console.log("Starting appointment flow with state:", state);

    if (!state) {
      console.error("No appointment state found for:", to);
      await this.whatsappService.sendMessage(
        to,
        i18next.t("errors.appointmentState")
      );
      return;
    }

    // Validate message input
    if (!message || message.trim() === "") {
      await this.whatsappService.sendMessage(
        to,
        i18next.t("errors.invalidInput")
      );
      return;
    }

    // Check message length limit
    if (message.length > 100) {
      await this.whatsappService.sendMessage(
        to,
        i18next.t("errors.inputTooLong")
      );
      return;
    }

    let response;
    try {
      // Handle different steps in the appointment flow
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
          response = await this.completeAppointment(to);
          break;
        default:
          console.error("Invalid appointment state:", state.step);
          delete this.appointmentState[to];
          throw new Error("Invalid appointment state");
      }

      // Log updated state for debugging
      console.log("Updated state:", this.appointmentState[to]);
      await this.whatsappService.sendMessage(to, response);
    } catch (error) {
      // Handle any errors during the appointment flow
      console.error("Error in appointment flow:", error);
      await this.whatsappService.sendMessage(
        to,
        i18next.t("errors.general")
      );
      delete this.appointmentState[to];
    }
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
      response = await this.openAiService(message);
    }

    delete this.assistantState[to];
    await this.whatsappService.sendMessage(to, response);
    await this.whatsappService.sendInteractiveButton(to, menuMessage, buttons);
  }

  async sendContact(to) {
    const contactInfo = config.CONTACT;

    if (!contactInfo) {
      console.error("No contact info found");
      return;
    }

    const contact = {
      addresses: [
        {
          street: contactInfo.street,
          city: contactInfo.city,
          state: contactInfo.state,
          zip: contactInfo.zip,
          country: contactInfo.country,
          country_code: contactInfo.country_code,
          type: "WORK",
        },
      ],
      emails: [
        {
          email: contactInfo.email,
          type: "WORK",
        },
      ],
      name: {
        formatted_name: contactInfo.name,
        first_name: contactInfo.company,
        last_name: contactInfo.department,
        middle_name: "",
        suffix: "",
        prefix: "",
      },
      org: {
        company: contactInfo.company,
        department: contactInfo.department,
        title: contactInfo.title,
      },
      phones: [
        {
          phone: contactInfo.phone,
          wa_id: contactInfo.wa_id,
          type: "WORK",
        },
      ],
      urls: [
        {
          url: contactInfo.website,
          type: "WORK",
        },
      ],
    };

    await this.whatsappService.sendContactMessage(to, contact);
  }

  async sendLocation(to) {
    const { LOCATION } = config;

    const location = {
      latitude: LOCATION.latitude,
      longitude: LOCATION.longitude,
      name: LOCATION.name,
      address: LOCATION.address,
    };

    return this.whatsappService.sendLocation(to, location);
  }
}

export default new MessageHandler();
