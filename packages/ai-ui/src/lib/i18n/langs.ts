export type LangCode =
  | "uk"
  | "en"
  | "pl"
  | "de"
  | "es"
  | "fr"
  | "it"
  | "pt"
  | "ru"
  | "tr";

export const LANGS: Record<LangCode, string> = {
  uk: "Ukrainian",
  en: "English",
  pl: "Polish",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  tr: "Turkish",
};
