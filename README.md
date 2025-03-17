# WhatsApp API Integration

A Node.js application that integrates with the WhatsApp Business API to handle automated messaging, appointments, and interactive menus.

## Features

- 🌐 Multi-language support (English/Spanish)
- 📅 Appointment scheduling system
- 🔄 Interactive menu with buttons
- 📍 Location sharing
- 📸 Media message support (images, audio, video, documents)
- ✨ Automated greeting responses
- ✅ Message read receipts

## Prerequisites

- Node.js v18 or higher
- WhatsApp Business API access
- Meta Developer account
- Valid SSL certificate (for production)

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

3. Create a `.env` file in the root directory with the following variables:
```env
WEBHOOK_VERIFY_TOKEN=your_verify_token
API_TOKEN=your_meta_api_token
PORT=3000
BUSINESS_PHONE=your_whatsapp_business_phone_id
API_VERSION=v22.0
BASE_URL=https://graph.facebook.com
BUSINESS_NAME=your_business_name
LANGUAGE=en
```

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

# Run tests with watch mode
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
├── __tests__/          # Test files
├── config/             # Configuration files
├── controllers/        # Route controllers
├── i18n/              # Internationalization
│   └── locales/       # Language files
├── services/          # Business logic
│   └── httpRequest/   # API communication
└── app.js             # Application entry point
```

## API Endpoints

### Webhook Verification
- `GET /webhook`
  - Verifies the webhook URL with WhatsApp Business API
  - Query Parameters:
    - `hub.mode`: subscribe
    - `hub.verify_token`: Your verification token
    - `hub.challenge`: Challenge string

### Message Reception
- `POST /webhook`
  - Receives incoming messages and events from WhatsApp
  - Handles:
    - Text messages
    - Interactive button responses
    - Message read status

## Features in Detail

### Appointment Flow
1. User sends a greeting
2. System responds with welcome message and menu
3. User selects "Schedule" option
4. System collects:
   - Owner's name
   - Pet's name
   - Pet type
   - Appointment reason
5. System confirms appointment

### Interactive Menu
- Schedule appointment
- General consultation
- Get business location

### Supported Message Types
- Text messages
- Interactive buttons
- Location sharing
- Media messages (audio, video, images, documents)

## Testing

The project includes comprehensive unit tests for:
- Message handling
- WhatsApp service integration
- Webhook controller
- Appointment flow
- Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Meta WhatsApp Business API
- i18next for internationalization
- Jest for testing
- ESLint for code quality 