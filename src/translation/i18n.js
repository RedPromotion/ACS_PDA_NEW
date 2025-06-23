import i18n from "i18next";
import {initReactI18next} from "react-i18next";

i18n.use(initReactI18next).init({
    resources: {
        K: {
            translation: null,
        },
        E: {
            translation: null,
        }
    },
    lng: "ko",
    fallbackLng: "ko",
    debug: false,
    keySeparator: false,
    nsSeparator: false,
    interpolation: {escapeValue: false},
});

export default i18n;