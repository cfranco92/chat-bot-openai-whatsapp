import { jest } from "@jest/globals";
import i18next from "i18next";
import { MessageHandler } from "../../services/messageHandler.js";

// i18next mock
jest.spyOn(i18next, "t").mockImplementation((key, options) => {
  if (key === "greetings" && options?.returnObjects) {
    return ["hola", "buenos días", "buenas tardes", "buenas noches"];
  }
  if (key === "welcome.greeting") {
    return `¡Hola ${options.name}!`;
  }
  if (key === "welcome.help") {
    return "¿En qué puedo ayudarte?";
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
