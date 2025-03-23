# WhatsApp API - Veterinary Appointment Bot

A WhatsApp bot for managing veterinary appointments using the official WhatsApp Business API. The bot allows users to schedule appointments for their pets through an interactive conversation flow.

## 🚀 Features

- WhatsApp webhook for receiving and processing messages
- Appointment management system with conversational flow
- Multi-language support (English and Spanish)
- Support for different message types:
  - Text
  - Images
  - Documents
  - Locations
  - Contacts
- Robust error handling system
- Comprehensive unit and integration tests
- Google Sheets integration for appointment storage

## 📋 Prerequisites

- Node.js (v14 or higher)
- NPM (v6 or higher)
- WhatsApp Business API account
- Google Sheets API credentials
- Configured environment variables

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/whatsapp-api.git
cd whatsapp-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:
```env
WHATSAPP_TOKEN=your_whatsapp_token    # Your WhatsApp Business API token
VERIFY_TOKEN=your_verification_token   # Your webhook verification token
LANGUAGE=en                           # Language setting (en/es)
SPREAD_SHEET_ID=your_spreadsheet_id   # Google Sheets ID for appointments
```

4. Set up Google Sheets:
- Create a new Google Sheet
- Share it with the service account email
- Copy the spreadsheet ID to your .env file
- Place your Google Sheets credentials in `src/credentials/credentials.json`

## 🚀 Usage

1. Start the server:
```bash
npm start
```

2. Verify the webhook:
- The webhook URL must be publicly accessible
- WhatsApp will send a GET verification request
- The server will respond with the challenge if the token is valid

3. Receive messages:
- Incoming messages will be processed automatically
- The bot will respond according to the configured conversation flow
- Appointments will be stored in Google Sheets

## 💬 Appointment Flow

The bot handles the following flow for scheduling appointments:

1. Initial greeting and options menu
2. Request client's name
3. Request pet's name
4. Request pet type
5. Request appointment reason
6. Appointment confirmation and storage in Google Sheets

## 🧪 Testing

The project includes comprehensive unit and integration tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

### Test Coverage

- Unit tests for `MessageHandler`
- Unit tests for `WhatsAppService`
- Unit tests for `GoogleSheetsService`
- Integration tests for webhook
- Integration tests for service flow
- Integration tests for appointment management

## 📦 Project Structure

```
src/
├── controllers/
│   └── webhookController.js
├── routes/
│   └── webhookRoutes.js
├── services/
│   ├── messageHandler.js
│   ├── whatsappService.js
│   └── googleSheetsService.js
├── i18n/
│   ├── locales/
│   │   ├── en.js
│   │   └── es.js
│   └── index.js
└── __tests__/
    ├── integration/
    │   ├── services.test.js
    │   └── webhook.test.js
    └── unit/
        ├── messageHandler.test.js
        └── whatsappService.test.js
```

## 🛠️ Technologies Used

- Express.js - Web framework
- Jest - Testing framework
- ESLint - Linter
- Supertest - API testing
- dotenv - Environment variables management
- i18next - Internationalization
- Google Sheets API - Appointment storage
- WhatsApp Business API - Messaging platform

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## ✨ Acknowledgments

- WhatsApp Business API Team
- Google Sheets API Team
- Project contributors
- Developer community

## 📞 Support

If you have any questions or issues:

- Open an issue on GitHub
- Send an email to [your-email@example.com]
- Check the [official WhatsApp Business API documentation](https://developers.facebook.com/docs/whatsapp)
- Check the [official Google Sheets API documentation](https://developers.google.com/sheets/api)