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
  });
});
