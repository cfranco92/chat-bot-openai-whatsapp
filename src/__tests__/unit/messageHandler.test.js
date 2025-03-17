import { jest } from "@jest/globals";
import i18next from "i18next";
import { MessageHandler } from "../../services/messageHandler.js";

// i18next mock
jest.spyOn(i18next, "t").mockImplementation((key, options) => {
  if (key === "greetings" && options?.returnObjects) {
    return {
      hi: "hola",
      hello: "hola",
      hey: "hey",
      "good morning": "buenos días",
      "good afternoon": "buenas tardes",
      "good evening": "buenas noches",
      greetings: "saludos"
    };
  }
  if (key === "welcome.greeting") {
    return `¡Hola ${options.name}! Bienvenido a ${options.businessName}`;
  }
  if (key === "welcome.help") {
    return "¿En qué puedo ayudarte?";
  }
  if (key === "echo") {
    return `Eco: ${options.message}`;
  }
  if (key === "appointment.enterName") {
    return "Por favor, ingresa tu nombre:";
  }
  if (key === "appointment.petName") {
    return "Gracias. Ahora, ¿cuál es el nombre de tu mascota?";
  }
  if (key === "appointment.petType") {
    return "Perfecto. Ahora, ¿qué tipo de mascota es? (por ejemplo: perro, gato, hurón, etc.)";
  }
  if (key === "appointment.reason") {
    return "¿Cuál es el motivo de la cita? (por ejemplo: vacunación, desparasitación, etc.)";
  }
  if (key === "appointment.summary.title") {
    return `Gracias ${options.name} por agendar tu cita.\nResumen de tu cita:`;
  }
  if (key === "appointment.summary.name") {
    return `Nombre: ${options.name}`;
  }
  if (key === "appointment.summary.petName") {
    return `Nombre de la mascota: ${options.petName}`;
  }
  if (key === "appointment.summary.petType") {
    return `Tipo de mascota: ${options.petType}`;
  }
  if (key === "appointment.summary.reason") {
    return `Motivo: ${options.reason}`;
  }
  if (key === "appointment.summary.followUp") {
    return "Nos pondremos en contacto contigo pronto para confirmar la fecha y hora de tu cita.";
  }
  return "translated text";
});

describe("MessageHandler", () => {
  let messageHandler;
  let mockWhatsAppService;
  let mockSendMessage;
  let mockMarkMessageAsRead;
  let mockSendInteractiveButton;

  beforeEach(() => {
    // Create mocks for WhatsAppService methods
    mockSendMessage = jest.fn();
    mockMarkMessageAsRead = jest.fn();
    mockSendInteractiveButton = jest.fn();

    // Create a mock instance of WhatsAppService
    mockWhatsAppService = {
      sendMessage: mockSendMessage,
      markMessageAsRead: mockMarkMessageAsRead,
      sendInteractiveButton: mockSendInteractiveButton,
    };

    // Create MessageHandler instance with the mock
    messageHandler = new MessageHandler(mockWhatsAppService);
  });

  describe("isGreeting", () => {
    test("should return true when message includes a greeting", () => {
      // Arrange
      const message = "hola, ¿cómo estás?";

      // Act
      const result = messageHandler.isGreeting(message);

      // Assert
      expect(result).toBe(true);
      expect(i18next.t).toHaveBeenCalledWith("greetings", { returnObjects: true });
    });

    test("should return false when message does not include a greeting", () => {
      // Arrange
      const message = "gracias";

      // Act
      const result = messageHandler.isGreeting(message);

      // Assert
      expect(result).toBe(false);
      expect(i18next.t).toHaveBeenCalledWith("greetings", { returnObjects: true });
    });
  });

  describe("handleIncomingMessage", () => {
    test("should handle text message with greeting", async () => {
      // Arrange
      const message = {
        type: "text",
        text: { body: "hola" },
        from: "1234567890",
        id: "msg123",
      };
      const senderInfo = {
        profile: { name: "John Doe" },
      };

      // Act
      await messageHandler.handleIncomingMessage(message, senderInfo);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "¡Hola John! Bienvenido a Contador Online\n¿En qué puedo ayudarte?",
        message.id,
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith(message.id);
    });

    test("should handle echo message", async () => {
      // Arrange
      const message = {
        type: "text",
        text: { body: "test message" },
        from: "1234567890",
        id: "msg123",
      };

      // Act
      await messageHandler.handleIncomingMessage(message);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "Eco: test message",
        message.id,
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith(message.id);
    });

    test("should handle interactive button message", async () => {
      // Arrange
      const message = {
        type: "interactive",
        interactive: {
          button_reply: {
            id: "option_1",
          },
        },
        from: "1234567890",
        id: "msg123",
      };

      // Act
      await messageHandler.handleIncomingMessage(message);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "Por favor, ingresa tu nombre:",
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith("msg123");
    });
  });

  describe("getSenderInfo", () => {
    test("should return name from profile", () => {
      // Arrange
      const senderInfo = {
        profile: { name: "John Doe" },
      };

      // Act
      const result = messageHandler.getSenderInfo(senderInfo);

      // Assert
      expect(result).toBe("John Doe");
    });

    test("should return wa_id when profile name is not available", () => {
      // Arrange
      const senderInfo = {
        wa_id: "1234567890",
      };

      // Act
      const result = messageHandler.getSenderInfo(senderInfo);

      // Assert
      expect(result).toBe("1234567890");
    });

    test("should return empty string when no info is available", () => {
      // Arrange
      const senderInfo = {};

      // Act
      const result = messageHandler.getSenderInfo(senderInfo);

      // Assert
      expect(result).toBe("");
    });
  });

  describe("handleAppointmentFlow", () => {
    test("should handle complete appointment flow", async () => {
      // Arrange
      const to = "1234567890";
      const messages = ["John Doe", "Max", "Perro", "Vacunación"];

      // Start appointment flow
      const interactiveMessage = {
        type: "interactive",
        interactive: {
          button_reply: {
            id: "option_1",
          },
        },
        from: to,
        id: "msg123",
      };
      await messageHandler.handleIncomingMessage(interactiveMessage);

      // Act
      await Promise.all(
        messages.map((message) => messageHandler.handleAppointmentFlow(to, message))
      );

      // Assert
      const expectedMessage =
        "Gracias John Doe por agendar tu cita.\nResumen de tu cita:\n\n" +
        "Nombre: John Doe\n" +
        "Nombre de la mascota: Max\n" +
        "Tipo de mascota: Perro\n" +
        "Motivo: Vacunación\n\n" +
        "Nos pondremos en contacto contigo pronto para confirmar la fecha y hora de tu cita.";

      expect(mockSendMessage).toHaveBeenCalledWith(to, expectedMessage);
    });
  });
});
