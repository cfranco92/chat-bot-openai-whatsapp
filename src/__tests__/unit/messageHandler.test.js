import { jest } from "@jest/globals";
import { MessageHandler } from "../../services/messageHandler.js";

// Establecer el idioma para las pruebas
process.env.LANGUAGE = "es";

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
        profile: { name: "John" },
      };

      // Act
      await messageHandler.handleIncomingMessage(message, senderInfo);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "¡Hola John! Bienvenido a Contadora Alejandra.\n¿En qué puedo ayudarte?",
        message.id,
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith(message.id);
    });

    test("should handle location message", async () => {
      // Arrange
      const message = {
        type: "location",
        location: {
          latitude: 37.422,
          longitude: -122.084,
          name: "Google HQ",
          address: "1600 Amphitheatre Parkway",
        },
        from: "1234567890",
        id: "msg123",
      };

      // Act
      await messageHandler.handleIncomingMessage(message);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "messages.locationReceived",
        message.id,
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith(message.id);
    });

    test("should handle contact message", async () => {
      // Arrange
      const message = {
        type: "contacts",
        contacts: [{
          name: {
            first_name: "John",
            last_name: "Doe",
          },
          phones: [{
            phone: "+1234567890",
            type: "HOME",
          }],
        }],
        from: "1234567890",
        id: "msg123",
      };

      // Act
      await messageHandler.handleIncomingMessage(message);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "messages.contactReceived",
        message.id,
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith(message.id);
    });

    test("should handle document message", async () => {
      // Arrange
      const message = {
        type: "document",
        document: {
          filename: "test.pdf",
          mime_type: "application/pdf",
          id: "doc123",
        },
        from: "1234567890",
        id: "msg123",
      };

      // Act
      await messageHandler.handleIncomingMessage(message);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        message.from,
        "messages.documentReceived",
        message.id,
      );
      expect(mockMarkMessageAsRead).toHaveBeenCalledWith(message.id);
    });
  });

  describe("handleAppointmentFlow", () => {
    test("should handle invalid input in appointment flow", async () => {
      // Arrange
      const to = "1234567890";
      const invalidInput = "";
      messageHandler.appointmentState[to] = { step: "name" };

      // Act
      await messageHandler.handleAppointmentFlow(to, invalidInput);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        to,
        "errors.invalidInput",
      );
    });

    test("should handle very long inputs in appointment flow", async () => {
      // Arrange
      const to = "1234567890";
      const veryLongInput = "a".repeat(1000);
      messageHandler.appointmentState[to] = { step: "name" };

      // Act
      await messageHandler.handleAppointmentFlow(to, veryLongInput);

      // Assert
      expect(mockSendMessage).toHaveBeenCalledWith(
        to,
        "errors.inputTooLong",
      );
    });
  });

  describe("Error Handling", () => {
    test("should handle undefined message object", async () => {
      await expect(messageHandler.handleIncomingMessage(undefined))
        .rejects
        .toThrow("Invalid message object");
    });

    test("should handle missing required message properties", async () => {
      const invalidMessage = {
        type: "text",
      };

      await expect(messageHandler.handleIncomingMessage(invalidMessage))
        .rejects
        .toThrow("Missing required message properties");
    });
  });
});
