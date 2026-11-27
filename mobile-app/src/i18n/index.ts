
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import te from "./locales/te.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import mr from "./locales/mr.json";
import bn from "./locales/bn.json";
import es from "./locales/es.json";
import ar from "./locales/ar.json";

export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
  },
] as const;

export type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function isSupportedLanguage(
  language: string
): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some(
    (item) => item.code === language
  );
}

export const i18nReady = i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      te: { translation: te },
      hi: { translation: hi },
      ta: { translation: ta },
      kn: { translation: kn },
      ml: { translation: ml },
      mr: { translation: mr },
      bn: { translation: bn },
      es: { translation: es },
      ar: { translation: ar },
    },

    lng: "en",
    fallbackLng: "en",

    supportedLngs: SUPPORTED_LANGUAGES.map(
      (item) => item.code
    ),

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export async function changeAppLanguage(
  language: string
): Promise<void> {
  await i18nReady;

  const selectedLanguage =
    isSupportedLanguage(language)
      ? language
      : "en";

  if (i18n.language !== selectedLanguage) {
    await i18n.changeLanguage(selectedLanguage);
  }
}

export default i18n;
