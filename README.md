# WhatsApp API para Clínica Veterinaria

Una aplicación Node.js que integra la API de WhatsApp Business para gestionar mensajería automatizada, citas veterinarias y menús interactivos para una clínica veterinaria.

## Características

- 🌐 Soporte multilingüe (Español/Inglés)
- 📅 Sistema de programación de citas
- 🔄 Menú interactivo con botones
- 📍 Compartir ubicación
- 📸 Soporte para mensajes multimedia (imágenes, audio, video, documentos)
- ✨ Respuestas automáticas de bienvenida
- ✅ Confirmación de lectura de mensajes
- 🧠 Asistente IA para consultas generales usando OpenAI
- 📊 Integración con Google Sheets para almacenar citas

## Requisitos previos

- Node.js v18 o superior
- Acceso a WhatsApp Business API
- Cuenta de desarrollador en Meta
- Certificado SSL válido (para producción)
- Cuenta de Google Cloud Platform (para la integración con Google Sheets)
- Cuenta de OpenAI (para el asistente IA)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tuusuario/whatsapp-api.git
cd whatsapp-api
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en el directorio raíz con las siguientes variables (ver `.env-example`):
```env
WEBHOOK_VERIFY_TOKEN=tu_token_de_verificacion
API_TOKEN=tu_token_de_api_meta
PORT=3000
BUSINESS_PHONE=tu_id_de_telefono_de_whatsapp_business
API_VERSION=v22.0
BASE_URL=https://graph.facebook.com
BUSINESS_NAME=nombre_de_tu_negocio
LANGUAGE=es
OPENAI_API_KEY=tu_clave_api_openai
GOOGLE_APPLICATION_CREDENTIALS=ruta_a_tu_archivo_de_credenciales
GOOGLE_SHEET_ID=tu_id_de_hoja_de_calculo
```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Pruebas
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo observador
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

### Linting
```bash
# Ejecutar linter
npm run lint

# Corregir problemas de linting
npm run lint:fix
```

## Estructura del Proyecto

```
src/
├── __tests__/           # Archivos de pruebas
├── config/              # Archivos de configuración
├── controllers/         # Controladores de rutas
│   └── webhookController.js  # Controlador del webhook
├── credentials/         # Credenciales para APIs externas
├── i18n/                # Internacionalización
│   └── locales/         # Archivos de idiomas (es.js, en.js)
├── routes/              # Definición de rutas
│   └── webhookRoutes.js # Rutas del webhook
├── services/            # Lógica de negocio
│   ├── googleSheetsService.js  # Servicio para Google Sheets
│   ├── messageHandler.js       # Manejador de mensajes
│   ├── openAiService.js        # Integración con OpenAI
│   ├── whatsappService.js      # Servicio de WhatsApp
│   └── httpRequest/            # Comunicación API
└── app.js               # Punto de entrada de la aplicación
```

## Endpoints de la API

### Verificación del Webhook
- `GET /webhook`
  - Verifica la URL del webhook con la API de WhatsApp Business
  - Parámetros de consulta:
    - `hub.mode`: subscribe
    - `hub.verify_token`: Tu token de verificación
    - `hub.challenge`: Cadena de desafío

### Recepción de Mensajes
- `POST /webhook`
  - Recibe mensajes y eventos entrantes de WhatsApp
  - Maneja:
    - Mensajes de texto
    - Respuestas de botones interactivos
    - Estado de lectura de mensajes

## Flujos Implementados

### Flujo de Citas
1. El usuario envía un saludo
2. El sistema responde con un mensaje de bienvenida y menú
3. El usuario selecciona la opción "Agendar"
4. El sistema solicita:
   - Nombre del propietario
   - Nombre de la mascota
   - Tipo de mascota
   - Motivo de la cita
5. El sistema confirma la cita y la guarda en Google Sheets

### Asistente IA
1. El usuario selecciona "Consulta general"
2. El sistema activa el modo asistente con OpenAI
3. El usuario puede hacer preguntas sobre cuidado de mascotas
4. El asistente responde usando el modelo de OpenAI

### Emergencia
- Proporciona información de contacto inmediato
- Muestra horarios de atención de emergencia

### Menú Interactivo
- Agendar cita
- Consulta general (Asistente IA)
- Obtener ubicación del negocio
- Emergencia

### Tipos de Mensajes Soportados
- Mensajes de texto
- Botones interactivos
- Compartir ubicación
- Mensajes multimedia (audio, video, imágenes, documentos)

## Pruebas

El proyecto incluye pruebas unitarias completas para:
- Manejo de mensajes
- Integración del servicio de WhatsApp
- Controlador de webhook
- Flujo de citas
- Soporte multilingüe
- Integración con OpenAI

## Contribuir

1. Haz un fork del repositorio
2. Crea tu rama de características (`git checkout -b feature/CaracteristicaIncreible`)
3. Confirma tus cambios (`git commit -m 'Añadir alguna CaracteristicaIncreible'`)
4. Empuja a la rama (`git push origin feature/CaracteristicaIncreible`)
5. Abre una Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia ISC.

## Agradecimientos

- API de WhatsApp Business de Meta
- i18next para internacionalización
- Jest para pruebas
- ESLint para calidad de código
- OpenAI para integración de IA
- Google Sheets API para almacenamiento de datos 