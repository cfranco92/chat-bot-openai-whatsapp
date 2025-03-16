import i18next from "i18next";
import en from "./locales/en.js";
import es from "./locales/es.js";
import config from "../config/env.js";

i18next.init({
  lng: config.LANGUAGE || "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },
});

export default i18next;
