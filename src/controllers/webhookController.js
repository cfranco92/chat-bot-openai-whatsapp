import config from "../config/env.js";
import messageHandler from "../services/messageHandler.js";

class WebhookController {
  async handleIncoming(req, res) {
    if (req.body.object !== "whatsapp_business_account") {
      return res.status(400).json({ error: "Invalid webhook data" });
    }

    const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
    const senderInfo = req.body.entry?.[0]?.changes[0]?.value?.contacts?.[0];

    if (message && senderInfo) {
      console.log("Message received: ", message);
      console.log("Sender info: ", senderInfo);
      await messageHandler.handleIncomingMessage(message, senderInfo);
    }
    return res.sendStatus(200);
  }

  verifyWebhook(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === config.WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
      console.log("Webhook verified successfully!");
    } else {
      res.sendStatus(403);
    }
  }
}

export default new WebhookController();
