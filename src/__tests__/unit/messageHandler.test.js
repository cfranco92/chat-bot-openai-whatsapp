import { jest } from "@jest/globals";
import i18next from "i18next";
import { MessageHandler } from "../../services/messageHandler.js";

// Mock de i18next
const mockTranslations = {
  greetings: ["hola", "hello", "hi"],
  "welcome.greeting": "¡Hola {name}!",
  "welcome.help": "¿En qué puedo ayudarte?",
  "menu.choose": "Por favor, elige una opción:",
  "menu.schedule": "Agendar cita",
  "menu.consult": "Consultar disponibilidad",
  "menu.location": "Ver ubicación",
  "errors.userMenuOption": "Lo siento, no entendí tu selección. Por favor, elige una de las opciones del menú",
};

// Mock de i18next
jest.spyOn(i18next, "t").mockImplementation((key, options) => {
  if (key === "greetings" && options?.returnObjects) {
    return mockTranslations[key];
  }
  if (key === "welcome.greeting" && options?.name) {
    return mockTranslations[key].replace("{name}", options.name);
  }
  return mockTranslations[key] || key;
});

describe("MessageHandler", () => {
  let messageHandler;
  let mockWhatsappService;
  let mockSendMessage;
  let mockMarkMessageAsRead;
  let mockSendInteractiveButton;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();

    // Crear mocks para los métodos de WhatsAppService
    mockSendMessage = jest.fn();
    mockMarkMessageAsRead = jest.fn();
    mockSendInteractiveButton = jest.fn();

    // Crear una instancia mock de WhatsAppService
    mockWhatsappService = {
      sendMessage: mockSendMessage,
      markMessageAsRead: mockMarkMessageAsRead,
      sendInteractiveButton: mockSendInteractiveButton,
    };

    // Crear instancia de MessageHandler con el mock
    messageHandler = new MessageHandler(mockWhatsappService);
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
        "¡Hola John!\n¿En qué puedo ayudarte?",
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
      expect(mockSendMessage).toHaveBeenCalled();
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
});
