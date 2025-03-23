import { jest } from "@jest/globals";
import { WhatsAppService } from "../../services/whatsappService.js";
import { MessageHandler } from "../../services/messageHandler.js";

// Establecer el idioma para las pruebas
process.env.LANGUAGE = "es";

describe("Services Integration Tests", () => {
  let whatsappService;
  let messageHandler;
  let mockSendToWhatsApp;

  beforeEach(() => {
    // Mock WhatsApp API calls
    mockSendToWhatsApp = jest.fn().mockResolvedValue({ success: true });
    whatsappService = new WhatsAppService(mockSendToWhatsApp);
    messageHandler = new MessageHandler(whatsappService);
  });

  describe("Message Flow Integration", () => {
    test("should handle greeting message flow correctly", async () => {
      // Arrange
      const message = {
        type: "text",
        text: { body: "hola" },
        from: "1234567890",
        id: "msg123",
      };
      const senderInfo = {
        profile: { name: "John" },
        wa_id: "1234567890",
      };

      // Act
      await messageHandler.handleIncomingMessage(message, senderInfo);

      // Assert
      // Should mark message as read
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      });

      // Should send welcome message
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: message.from,
        text: {
          body: "¡Hola John! Bienvenido a Contadora Alejandra.\n¿En qué puedo ayudarte?",
        },
        context: { message_id: message.id },
      });
    });

    test("should handle appointment flow correctly", async () => {
      // Arrange
      const to = "1234567890";
      const initialMessage = {
        type: "interactive",
        interactive: {
          button_reply: {
            id: "option_1",
          },
        },
        from: to,
        id: "msg123",
      };

      // Act & Assert
      // Start appointment flow
      await messageHandler.handleIncomingMessage(initialMessage);
      expect(mockSendToWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({
          messaging_product: "whatsapp",
          to,
          text: expect.any(Object),
        })
      );

      // Send name
      await messageHandler.handleAppointmentFlow(to, "John Doe");
      expect(mockSendToWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({
          messaging_product: "whatsapp",
          to,
          text: expect.any(Object),
        })
      );

      // Send pet name
      await messageHandler.handleAppointmentFlow(to, "Max");
      expect(mockSendToWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({
          messaging_product: "whatsapp",
          to,
          text: expect.any(Object),
        })
      );

      // Send pet type
      await messageHandler.handleAppointmentFlow(to, "Perro");
      expect(mockSendToWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({
          messaging_product: "whatsapp",
          to,
          text: expect.any(Object),
        })
      );

      // Send appointment reason
      await messageHandler.handleAppointmentFlow(to, "Vacunación");
      expect(mockSendToWhatsApp).toHaveBeenCalledWith(
        expect.objectContaining({
          messaging_product: "whatsapp",
          to,
          text: expect.any(Object),
        })
      );
    });

    test("should handle media message flow correctly", async () => {
      // Arrange
      const message = {
        type: "image",
        image: {
          id: "img123",
          caption: "Mi mascota",
          mime_type: "image/jpeg",
        },
        from: "1234567890",
        id: "msg123",
      };
      const senderInfo = {
        profile: { name: "John" },
        wa_id: "1234567890",
      };

      // Act
      await messageHandler.handleIncomingMessage(message, senderInfo);

      // Assert
      // Should mark message as read
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      });

      // Should acknowledge receipt of image
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: message.from,
        text: {
          body: "messages.imageReceived",
        },
        context: { message_id: message.id },
      });
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle invalid message types gracefully", async () => {
      // Arrange
      const message = {
        type: "invalid_type",
        from: "1234567890",
        id: "msg123",
      };

      // Act & Assert
      await expect(messageHandler.handleIncomingMessage(message))
        .rejects
        .toThrow("errors.unsupportedMessageType");

      // Should still mark message as read
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        status: "read",
        message_id: message.id,
      });
    });

    test("should handle API errors gracefully", async () => {
      // Arrange
      const message = {
        type: "text",
        text: { body: "hola" },
        from: "1234567890",
        id: "msg123",
      };
      mockSendToWhatsApp.mockRejectedValueOnce(new Error("API Error"));

      // Act & Assert
      await expect(messageHandler.handleIncomingMessage(message))
        .rejects
        .toThrow("API Error");
    });
  });
});
