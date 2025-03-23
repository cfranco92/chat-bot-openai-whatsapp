import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockWebhookController = {
  handleIncoming: jest.fn((req, res) => {
    if (!req.body || !req.body.object || !req.body.entry) {
      return res.sendStatus(400);
    }
    return res.sendStatus(200);
  }),
  verifyWebhook: jest.fn((req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      res.send(challenge);
    } else {
      res.sendStatus(403);
    }
  }),
};

jest.unstable_mockModule("../../controllers/webhookController.js", () => ({
  default: mockWebhookController,
}));

const { default: webhookRouter } = await import("../../routes/webhookRoutes.js");

let app;

beforeEach(() => {
  // Configurar variables de entorno
  process.env.WEBHOOK_VERIFY_TOKEN = "test_token";
  app = express();
  app.use(express.json());
  app.use(webhookRouter);
  // Clear all mocks
  jest.clearAllMocks();
});

describe("Webhook Integration Tests", () => {
  describe("GET /webhook", () => {
    it("should verify webhook subscription", async () => {
      process.env.VERIFY_TOKEN = "test_token";

      const response = await request(app)
        .get("/webhook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": "test_token",
          "hub.challenge": "1234"
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe("1234");
      expect(mockWebhookController.verifyWebhook).toHaveBeenCalled();
    });

    it("should reject invalid verify token", async () => {
      process.env.VERIFY_TOKEN = "test_token";

      const response = await request(app)
        .get("/webhook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": "wrong_token",
          "hub.challenge": "1234"
        });

      expect(response.status).toBe(403);
      expect(mockWebhookController.verifyWebhook).toHaveBeenCalled();
    });
  });

  describe("POST /webhook", () => {
    it("should handle incoming messages", async () => {
      const mockMessage = {
        object: "whatsapp_business_account",
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: "1234567890",
                type: "text",
                text: { body: "Hello" }
              }]
            }
          }]
        }]
      };

      const response = await request(app)
        .post("/webhook")
        .send(mockMessage);

      expect(response.status).toBe(200);
      expect(mockWebhookController.handleIncoming).toHaveBeenCalled();
    });

    it("should handle invalid webhook data", async () => {
      const response = await request(app)
        .post("/webhook")
        .send({});

      expect(response.status).toBe(400);
      expect(mockWebhookController.handleIncoming).toHaveBeenCalled();
    });

    test("should handle status updates", async () => {
      const webhookData = {
        object: "whatsapp_business_account",
        entry: [{
          changes: [{
            value: {
              statuses: [{
                id: "msg123",
                status: "delivered",
                timestamp: "1234567890",
                recipient_id: "1234567890",
              }],
            },
          }],
        }],
      };

      const response = await request(app)
        .post("/webhook")
        .send(webhookData);

      expect(response.status).toBe(200);
    });
  });
});
