export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
];

export const normalizeToPrimaryTag = (code?: string): string => {
  if (!code) return "";
  return code.split("-")[0].toLowerCase();
};

export const resolveLanguageName = (code?: string): string => {
  if (!code) return "Unknown";
  const primary = normalizeToPrimaryTag(code);
  const lang = LANGUAGES.find((l) => l.code === primary);
  return lang ? lang.name : code;
};

export const SAMPLE_TEXTS = [
  {
    lang: "en",
    text: "Hello! Welcome to the Chrome Translator API demo. This powerful tool allows real-time translation directly in your browser.",
  },
  {
    lang: "es",
    text: "¿Cómo estás? Este es un texto de ejemplo en español para demostrar las capacidades de traducción.",
  },
  {
    lang: "fr",
    text: "Bonjour! C'est une démonstration de l'API de traduction Chrome avec traitement local des données.",
  },
  {
    lang: "de",
    text: "Guten Tag! Diese Demonstration zeigt die Übersetzungsfähigkeiten der Chrome Built-in AI.",
  },
  {
    lang: "ja",
    text: "こんにちは！これはChromeの翻訳APIデモです。ブラウザ内で直接翻訳が可能です。",
  },
];
