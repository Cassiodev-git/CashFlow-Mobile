import { createInstance } from "i18next";

import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";

import pt from "./locales/pt.json";

import en from "./locales/en.json";

const i18n = createInstance();

const deviceLanguage =
    Localization.getLocales()[0]?.languageCode;

    i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: "v4",

        lng: deviceLanguage === "en" ? "en" : "pt",

        fallbackLng: "pt",

        resources: {
        pt: {
            translation: pt,
        },

        en: {
            translation: en,
        },
        },

        interpolation: {
        escapeValue: false,
        },
    });

export default i18n;
