import { jest } from "@jest/globals";
import { WhatsAppService } from "../../services/whatsappService.js";

describe("WhatsAppService", () => {
  let whatsappService;
  let mockSendToWhatsApp;

  beforeEach(() => {
    mockSendToWhatsApp = jest.fn();
    whatsappService = new WhatsAppService(mockSendToWhatsApp);
  });

  describe("sendMessage", () => {
    test("should send a text message successfully", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Test message";
      const messageId = "msg123";
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMessage(to, text, messageId);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
        context: { message_id: messageId },
      });
    });

    test("should send a text message without context when messageId is not provided", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Test message";
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMessage(to, text);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      });
    });

    test("should handle empty message text", async () => {
      // Arrange
      const to = "1234567890";
      const text = "";

      // Act & Assert
      await expect(whatsappService.sendMessage(to, text))
        .rejects
        .toThrow("Message text cannot be empty");
    });

    test("should handle very long message text", async () => {
      // Arrange
      const to = "1234567890";
      const text = "a".repeat(4096);
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMessage(to, text);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      });
    });

    test("should handle special characters in message", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Hello 👋 ñ áéíóú";
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMessage(to, text);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      });
    });
  });

  describe("markMessageAsRead", () => {
    test("should mark message as read", async () => {
      // Arrange
      const messageId = "msg123";
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.markMessageAsRead(messageId);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      });
    });
  });

  describe("sendInteractiveButton", () => {
    test("should send interactive button message", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Select an option";
      const buttons = [
        {
          id: "btn1",
          title: "Button 1",
        },
        {
          id: "btn2",
          title: "Button 2",
        },
      ];
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendInteractiveButton(to, text, buttons);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text,
          },
          action: {
            buttons: buttons.map((button) => ({
              type: "reply",
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      });
    });

    test("should handle maximum number of buttons", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Select an option";
      const buttons = Array.from({ length: 3 }, (_, i) => ({
        id: `btn${i + 1}`,
        title: `Button ${i + 1}`,
      }));
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendInteractiveButton(to, text, buttons);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text },
          action: {
            buttons: buttons.map((button) => ({
              type: "reply",
              reply: {
                id: button.id,
                title: button.title,
              },
            })),
          },
        },
      });
    });

    test("should handle empty button list", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Select an option";
      const buttons = [];

      // Act & Assert
      await expect(whatsappService.sendInteractiveButton(to, text, buttons))
        .rejects
        .toThrow("At least one button is required");
    });

    test("should handle buttons with long titles", async () => {
      // Arrange
      const to = "1234567890";
      const text = "Select an option";
      const buttons = [{
        id: "btn1",
        title: "a".repeat(20),
      }];
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendInteractiveButton(to, text, buttons);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text },
          action: {
            buttons: [{
              type: "reply",
              reply: {
                id: "btn1",
                title: "a".repeat(20),
              },
            }],
          },
        },
      });
    });
  });

  describe("sendMediaMessage", () => {
    test("should send media message with all parameters", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "image",
        mediaUrl: "http://example.com/image.jpg",
        caption: "Test caption",
      };
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMediaMessage(params);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: params.to,
        type: params.type,
        image: {
          link: params.mediaUrl,
          caption: params.caption,
        },
      });
    });

    test("should send media message without caption", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "image",
        mediaUrl: "http://example.com/image.jpg",
      };
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMediaMessage(params);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: params.to,
        type: params.type,
        image: {
          link: params.mediaUrl,
        },
      });
    });

    test("should handle video message", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "video",
        mediaUrl: "http://example.com/video.mp4",
        caption: "Test video",
      };
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMediaMessage(params);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: params.to,
        type: params.type,
        video: {
          link: params.mediaUrl,
          caption: params.caption,
        },
      });
    });

    test("should handle audio message", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "audio",
        mediaUrl: "http://example.com/audio.mp3",
      };
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMediaMessage(params);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: params.to,
        type: params.type,
        audio: {
          link: params.mediaUrl,
        },
      });
    });

    test("should handle document message", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "document",
        mediaUrl: "http://example.com/doc.pdf",
        filename: "test.pdf",
      };
      mockSendToWhatsApp.mockResolvedValue({ success: true });

      // Act
      await whatsappService.sendMediaMessage(params);

      // Assert
      expect(mockSendToWhatsApp).toHaveBeenCalledWith({
        messaging_product: "whatsapp",
        to: params.to,
        type: params.type,
        document: {
          link: params.mediaUrl,
          filename: params.filename,
        },
      });
    });

    test("should handle invalid media type", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "invalid_type",
        mediaUrl: "http://example.com/file",
      };

      // Act & Assert
      await expect(whatsappService.sendMediaMessage(params))
        .rejects
        .toThrow("Unsupported media type");
    });

    test("should handle invalid media URL", async () => {
      // Arrange
      const params = {
        to: "1234567890",
        type: "image",
        mediaUrl: "invalid_url",
      };

      // Act & Assert
      await expect(whatsappService.sendMediaMessage(params))
        .rejects
        .toThrow("Invalid media URL");
    });
  });

  describe("Error Handling", () => {
    test("should handle network errors", async () => {
      const to = "1234567890";
      const text = "Test message";
      mockSendToWhatsApp.mockRejectedValue(new Error("Network error"));

      await expect(whatsappService.sendMessage(to, text))
        .rejects
        .toThrow("Network error");
    });

    test("should handle API rate limit errors", async () => {
      const to = "1234567890";
      const text = "Test message";
      const error = new Error("Too many requests");
      error.response = {
        status: 429,
        data: { error: { message: "Too many requests" } },
      };
      mockSendToWhatsApp.mockRejectedValue(error);

      await expect(whatsappService.sendMessage(to, text))
        .rejects
        .toThrow("Too many requests");
    });

    test("should handle invalid phone number format", async () => {
      const to = "";
      const text = "Test message";

      await expect(whatsappService.sendMessage(to, text))
        .rejects
        .toThrow("Invalid phone number format");
    });
  });
});
