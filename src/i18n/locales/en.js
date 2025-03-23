export default {
  welcome: {
    greeting: "Hello {{name}}! Welcome to {{businessName}}.",
    help: "How can I help you today?",
  },
  menu: {
    choose: "Choose an option",
    schedule: "Schedule",
    consult: "Consult",
    location: "Location",
  },
  appointment: {
    enterName: "Please enter your name:",
    petName: "Thank you. Now, what's your pet's name?",
    petType:
      "Perfect. Now, what type of pet is it? (for example: dog, cat, ferret, etc.)",
    reason:
      "What's the reason for the appointment? (for example: vaccination, deworming, etc.)",
    confirmation:
      "Thank you for your preference. Your appointment has been scheduled.",
    summary: {
      title: "Thank you {{name}} for scheduling your appointment.\nAppointment Summary:",
      name: "Name: {{name}}",
      petName: "Pet's name: {{petName}}",
      petType: "Pet type: {{petType}}",
      reason: "Reason: {{reason}}",
      followUp: "We will contact you soon to confirm the date and time of your appointment."
    }
  },
  location: {
    name: "MedPet Veterinary",
    address: "Historic Center, Mexico City",
  },
  media: {
    welcome: "Welcome",
    image: "This is an Image!",
    video: "This is a video!",
    document: "This is a PDF!",
  },
  errors: {
    userMenuOption:
      "Sorry, I didn't understand your selection. Please choose one of the menu options",
  },
  consult: {
    prompt: "What would you like to consult about?",
    feedback: "Was my answer helpful?",
    thankYou: "Yes, thank you",
    anotherQuestion: "Ask another question",
    emergency: "Emergency"
  },
  contact: {
    message: "Here is our contact information for emergencies:",
    details: {
      street: "123 Pet Street",
      city: "City",
      state: "State",
      zip: "12345",
      country: "Country",
      email: "contact@medpet.com",
      name: "MedPet Contact",
      company: "MedPet",
      department: "Customer Service",
      title: "Representative",
      phone: "+1234567890",
      website: "https://www.medpet.com"
    }
  },
  greetings: {
    hi: "hi",
    hello: "hello",
    hey: "hey",
    "good morning": "good morning",
    "good afternoon": "good afternoon",
    "good evening": "good evening",
    greetings: "greetings",
  },
  echo: "Echo: {{message}}"
};
