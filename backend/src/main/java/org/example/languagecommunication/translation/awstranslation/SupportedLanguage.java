package org.example.languagecommunication.translation.awstranslation;

import lombok.Getter;

@Getter
public enum SupportedLanguage {
    AFRIKAANS("af","none", "none", "af-ZA"),
    ALBANIAN("sq","none", "none", "none"),
    AMHARIC("am","none", "none", "none"),
    ARABIC("ar", "Zeina", "standard", "none"),
    ARMENIAN("hy","none", "none", "none"),
    AZERBAIJANI("az","none", "none", "none"),
    BENGALI("bn","none", "none", "none"),
    BOSNIAN("bs","none", "none", "none"),
    BULGARIAN("bg","none", "none", "none"),
    CATALAN("ca", "Arlet", "neural", "ca-ES"),
    CHINESE("zh", "Zhiyu", "standard", "zh-CN"),
    CROATIAN("hr","none", "none", "hr-HR"),
    CZECH("cs", "Jitka", "neural", "cs-CZ"),
    DANISH("da", "Naja", "standard", "da-DK"),
    DARI("fa-AF","none", "none", "none"),
    DUTCH("nl", "Lotte", "standard", "nl-NL"),
    ENGLISH("en", "Joanna", " neural", "en-US"),
    ESTONIAN("et","none", "none", "none"),
    FARSI("fa","none", "none", "none"),
    FILIPINO_TAGALOG("tl","none", "none", "tl-PH"),
    FINNISH("fi", "Suvi", "neural", "fi-FI"),
    FRENCH("fr", "Celine", "standard", "fr-FR"),
    FRENCH_CANADA("fr-CA", "Chantal", "neural", "fr-CA"),
    GEORGIAN("ka","none", "none", "none"),
    GERMAN("de", "Marlene", "standard", "de-DE"),
    GREEK("el","none", "none", "el-GR"),
    GUJARATI("gu","none", "none", "none"),
    HAITIAN_CREOLE("ht","none", "none", "none"),
    HAUSA("ha","none", "none", "none"),
    HEBREW("he","none", "none", "he-IL"),
    HINDI("hi", "Aditi", "standard", "hi-IN"),
    HUNGARIAN("hu","none", "none", "none"),
    ICELANDIC("is", "Dora", "standard", "none"),
    INDONESIAN("id","none", "none", "id-ID"),
    IRISH("ga","none", "none", "none"),
    ITALIAN("it", "Carla", "standard", "it-IT"),
    JAPANESE("ja", "Mizuki", "standard", "ja-JP"),
    KANNADA("kn","none", "none", "none"),
    KAZAKH("kk","none", "none", "none"),
    KOREAN("ko", "Seoyeon", "standard", "ko-KR"),
    LATVIAN("lv","none", "none", "lv-LV"),
    LITHUANIAN("lt","none", "none", "none"),
    MACEDONIAN("mk","none", "none", "none"),
    MALAY("ms","none", "none", "ms-MY"),
    MALAYALAM("ml","none", "none", "none"),
    MALTESE("mt","none", "none", "none"),
    MARATHI("mr","none", "none", "none"),
    MONGOLIAN("mn","none", "none", "none"),
    NORWEGIAN_BOKMAL("no", "Liv", "standard", "none"),
    PASHTO("ps","none", "none", "none"),
    POLISH("pl", "Ewa", "standard", "pl-PL"),
    PORTUGUESE_BRAZIL("pt", "Camila", "standard", "pt-BR"),
    PORTUGUESE_PORTUGAL("pt-PT", "Ines", "standard", "pt-PT"),
    PUNJABI("pa","none", "none", "none"),
    ROMANIAN("ro", "Carmen", "standard", "ro-RO"),
    RUSSIAN("ru", "Tatyana", "standard", "ru-RU"),
    SERBIAN("sr","none", "none", "sr-RS"),
    SINHALA("si","none", "none", "none"),
    SLOVAK("sk","none", "none", "sk-SK"),
    SLOVENIAN("sl","none", "none", "none"),
    SOMALI("so", "none", "none", "so-So"),
    SPANISH("es", "Conchita", "standard", "es-ES"),
    SPANISH_MEXICO("es-MX", "Mia", "standard", "es-US"),
    SWAHILI("sw","none", "none", "none"),
    SWEDISH("sv", "Astrid", "standard", "sv-SE"),
    TAMIL("ta","none", "none", "none"),
    TELUGU("te","none", "none", "none"),
    THAI("th","none", "none", "th-TH"),
    TURKISH("tr", "Filiz", "standard", "none"),
    UKRAINIAN("uk","none", "none", "uk-UA"),
    URDU("ur","none", "none", "none"),
    UZBEK("uz","none", "none", "none"),
    VIETNAMESE("vi","none", "none", "vi-VN"),
    WELSH("cy", "Gwyneth", "standard", "none");

    private final String languageCode;
    private final String voiceId;
    private final String engine;
    private final String transcribeLangCode;

    SupportedLanguage(String languageCode, String voiceId, String engine, String transcribeLangCode) {
        this.languageCode = languageCode;
        this.voiceId = voiceId;
        this.engine = engine;
        this.transcribeLangCode = transcribeLangCode;
    }

    public static SupportedLanguage fromLanguageCode(String languageCode) {
        for (SupportedLanguage lang : SupportedLanguage.values()) {
            if (lang.getLanguageCode().equalsIgnoreCase(languageCode)) {
                return lang;
            }
        }
        throw new IllegalArgumentException("Unsupported language code: " + languageCode);
    }
}

