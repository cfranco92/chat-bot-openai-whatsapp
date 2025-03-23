# WhatsApp API for Veterinary Clinic

A Node.js application that integrates with the WhatsApp Business API to manage automated messaging, veterinary appointments, and interactive menus for a veterinary clinic.

## Features

- 🌐 Multi-language support (Spanish/English)
- 📅 Appointment scheduling system
- 🔄 Interactive menu with buttons
- 📍 Location sharing
- 📸 Support for multimedia messages (images, audio, video, documents)
- ✨ Automatic welcome responses
- ✅ Message read confirmation
- 🧠 AI assistant for general inquiries using OpenAI
- 📊 Integration with Google Sheets for storing appointments

## Prerequisites

- Node.js v18 or higher
- Access to WhatsApp Business API
- Meta Developer Account
- Valid SSL certificate (for production)
- Google Cloud Platform account (for Google Sheets integration)
- OpenAI account (for AI assistant)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whatsapp-api.git
cd whatsapp-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables (see `.env-example`):
```env
WEBHOOK_VERIFY_TOKEN=your_verification_token
API_TOKEN=your_meta_api_token
PORT=3000
BUSINESS_PHONE=your_whatsapp_business_phone_id
API_VERSION=v22.0
BASE_URL=https://graph.facebook.com
BUSINESS_NAME=your_business_name
LANGUAGE=en
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
ROLE_PROMPT=your_system_prompt
SPREAD_SHEET_ID=your_sheet_id
CONTACT={"formatted_name":"Your Clinic","phone_number":"1234567890"}
LOCATION={"latitude":19.4326,"longitude":-99.1332,"name":"MedPet Veterinary Clinic","address":"Historic Center, Mexico City"}
```

Note that `CONTACT` and `LOCATION` are JSON-formatted strings containing contact and location information respectively.

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
src/
├── __tests__/           # Test files
├── config/              # Configuration files
├── controllers/         # Route controllers
│   └── webhookController.js  # Webhook controller
├── credentials/         # Credentials for external APIs
├── i18n/                # Internationalization
│   └── locales/         # Language files (es.js, en.js)
├── routes/              # Route definitions
│   └── webhookRoutes.js # Webhook routes
├── services/            # Business logic
│   ├── googleSheetsService.js  # Google Sheets service
│   ├── messageHandler.js       # Message handler
│   ├── openAiService.js        # OpenAI integration
│   ├── whatsappService.js      # WhatsApp service
│   └── httpRequest/            # API communication
└── app.js               # Application entry point
```

## Environment Configuration

The application uses environment variables for most of its configuration, making it easy to adapt to different environments without code changes.

### Multilingual Support

The application supports multiple languages by setting the `LANGUAGE` environment variable to `"es"` for Spanish or `"en"` for English. This affects all text messages sent to users.

Location information is managed directly through the `LOCATION` environment variable and is not subject to translation:

```env
LOCATION={"latitude":19.4326,"longitude":-99.1332,"name":"MedPet Veterinary Clinic","address":"Historic Center, Mexico City"}
```

To provide a localized experience, you should set the `name` and `address` fields in the `LOCATION` variable to match your primary audience language.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `WEBHOOK_VERIFY_TOKEN` | Token for verifying webhook calls from Meta |
| `API_TOKEN` | Your Meta API token |
| `BUSINESS_PHONE` | WhatsApp Business phone ID |
| `API_VERSION` | Meta API version (e.g., v22.0) |
| `BUSINESS_NAME` | Your business name |
| `LANGUAGE` | Default language (en/es) |
| `OPENAI_API_KEY` | API key for OpenAI integration |
| `OPENAI_MODEL` | OpenAI model to use (e.g., gpt-4) |
| `ROLE_PROMPT` | System prompt for the AI assistant |
| `SPREAD_SHEET_ID` | Google Sheet ID for appointment storage |
| `CONTACT` | JSON with contact information |
| `LOCATION` | JSON with location information (coordinates, name and address) |

## API Endpoints

### Webhook Verification
- `GET /webhook`
  - Verifies the webhook URL with the WhatsApp Business API
  - Query parameters:
    - `hub.mode`: subscribe
    - `hub.verify_token`: Your verification token
    - `hub.challenge`: Challenge string

### Receiving Messages
- `POST /webhook`
  - Receives incoming messages and events from WhatsApp
  - Handles:
    - Text messages
    - Interactive button responses
    - Message read status

## Implemented Flows

### Appointment Flow
1. User sends a greeting
2. System responds with a welcome message and menu
3. User selects the "Schedule" option
4. System requests:
   - Owner name
   - Pet name
   - Pet type
   - Appointment reason
5. System confirms the appointment and saves it to Google Sheets

### AI Assistant
1. User selects "General Inquiry"
2. System activates assistant mode with OpenAI
3. User can ask questions about pet care
4. Assistant responds using the OpenAI model

### Emergency
- Provides immediate contact information
- Shows emergency service hours

### Interactive Menu
- Schedule appointment
- General inquiry (AI Assistant)
- Get business location
- Emergency

### Supported Message Types
- Text messages
- Interactive buttons
- Location sharing
- Multimedia messages (audio, video, images, documents)

## Tests

The project includes comprehensive unit tests for:
- Message handling
- WhatsApp service integration
- Webhook controller
- Appointment flow
- Multi-language support
- OpenAI integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgements

- Meta WhatsApp Business API
- i18next for internationalization
- Jest for testing
- ESLint for code quality
- OpenAI for AI integration
- Google Sheets API for data storage