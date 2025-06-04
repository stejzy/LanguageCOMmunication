package org.example.languagecommunication.translation.awstranslation.model;

import lombok.Getter;

@Getter
public enum SupportedLanguage {
   ALBANIAN("sq","none", "none", "none", "ALBAŃSKI"),
   AMHARIC("am","none", "none", "none", "AMHARYJSKI"),
   ARABIC("ar", "Zeina", "standard", "none", "ARABSKI"),
   ARMENIAN("hy","none", "none", "none", "ORMIAŃSKI"),
   AZERBAIJANI("az","none", "none", "none", "AZERSKI"),
   BENGALI("bn","none", "none", "none", "BENGALSKI"),
   BOSNIAN("bs","none", "none", "none", "BOŚNIACKI"),
   BULGARIAN("bg","none", "none", "none", "BUŁGARSKI"),
   CATALAN("ca", "Arlet", "neural", "ca-ES", "KATALOŃSKI"),
   CHINESE("zh", "Zhiyu", "standard", "zh-CN", "CHIŃSKI"),
   CROATIAN("hr","none", "none", "hr-HR", "CHORWACKI"),
   CZECH("cs", "Jitka", "neural", "cs-CZ", "CZESKI"),
   DANISH("da", "Naja", "standard", "da-DK", "DUŃSKI"),
   DARI("fa-AF","none", "none", "none", "DARI"),
   DUTCH("nl", "Lotte", "standard", "nl-NL", "HOLENDERSKI"),
   ENGLISH("en", "Joanna", " neural", "en-US", "ANGIELSKI"),
   ESTONIAN("et","none", "none", "none", "ESTOŃSKI"),
   FARSI("fa","none", "none", "none", "PERSKI"),
 FILIPINO_TAGALOG("tl","none", "none", "tl-PH", "FILIPIŃSKI_TAGALOG"),
    FINNISH("fi", "Suvi", "neural", "fi-FI", "FIŃSKI"),
    FRENCH("fr", "Celine", "standard", "fr-FR", "FRANCUSKI"),
    FRENCH_CANADA("fr-CA", "Chantal", "neural", "fr-CA", "FRANCUSKI_KANADYJSKI"),
    GEORGIAN("ka","none", "none", "none", "GRUZIŃSKI"),
    GERMAN("de", "Marlene", "standard", "de-DE", "NIEMIECKI"),
    GREEK("el","none", "none", "el-GR", "GRECKI"),
    GUJARATI("gu","none", "none", "none", "GUJARATI"),
    HAITIAN_CREOLE("ht","none", "none", "none", "HAITAŃSKI_KREOLSKI"),
    HAUSA("ha","none", "none", "none", "HAUSA"),
    HEBREW("he","none", "none", "he-IL", "HEBRAJSKI"),
    HINDI("hi", "Aditi", "standard", "hi-IN", "HINDI"),
    HUNGARIAN("hu","none", "none", "none", "WĘGIERSKI"),
    ICELANDIC("is", "Dora", "standard", "none", "ISLANDZKI"),
    INDONESIAN("id","none", "none", "id-ID", "INDONEZYJSKI"),
    IRISH("ga","none", "none", "none", "IRLANDZKI"),
    ITALIAN("it", "Carla", "standard", "it-IT", "WŁOSKI"),
    JAPANESE("ja", "Mizuki", "standard", "ja-JP", "JAPOŃSKI"),
    KANNADA("kn","none", "none", "none", "KANNADA"),
    KAZAKH("kk","none", "none", "none", "KAZACHSTAŃSKI"),
    KOREAN("ko", "Seoyeon", "standard", "ko-KR", "KOREAŃSKI"),
    LATVIAN("lv","none", "none", "lv-LV", "ŁOTEWSKI"),
   LITHUANIAN("lt","none", "none", "none", "LITEWSKI"),
    MACEDONIAN("mk","none", "none", "none", "MACEDOŃSKI"),
    MALAY("ms","none", "none", "ms-MY", "MALAJSKI"),
    MALAYALAM("ml","none", "none", "none", "MALAJALAM"),
    MALTESE("mt","none", "none", "none", "MALTAŃSKI"),
    MARATHI("mr","none", "none", "none", "MARATHI"),
    MONGOLIAN("mn","none", "none", "none", "MONGOLSKI"),
    NORWEGIAN_BOKMAL("no", "Liv", "standard", "none", "NORWESKI_BOKMAL"),
    PASHTO("ps","none", "none", "none", "PASZTO"),
    POLISH("pl", "Ewa", "standard", "pl-PL", "POLSKI"),
    PORTUGUESE_BRAZIL("pt", "Camila", "standard", "pt-BR", "PORTUGALSKI_BRAZYLIJSKI"),
    PORTUGUESE_PORTUGAL("pt-PT", "Ines", "standard", "pt-PT", "PORTUGALSKI_PORTUGALSKI"),
    PUNJABI("pa","none", "none", "none", "PENDŻABSKI"),
    ROMANIAN("ro", "Carmen", "standard", "ro-RO", "RUMUŃSKI"),
    RUSSIAN("ru", "Tatyana", "standard", "ru-RU", "ROSYJSKI"),
    SERBIAN("sr","none", "none", "sr-RS", "SERBSKI"),
    SINHALA("si","none", "none", "none", "SYNGALESKI"),
    SLOVAK("sk","none", "none", "sk-SK", "SŁOWACKI"),
    SLOVENIAN("sl","none", "none", "none", "SŁOWEŃSKI"),
    SOMALI("so", "none", "none", "so-So", "SOMALIJSKI"),
    SPANISH("es", "Conchita", "standard", "es-ES", "HISZPAŃSKI"),
    SPANISH_MEXICO("es-MX", "Mia", "standard", "es-US", "HISZPAŃSKI_MEKSYKAŃSKI"),
    SWAHILI("sw","none", "none", "none", "SWAHILI"),
    SWEDISH("sv", "Astrid", "standard", "sv-SE", "SZWEDZKI"),
    TAMIL("ta","none", "none", "none", "TAMILSKI"),
    TELUGU("te","none", "none", "none", "TELUGU"),
    THAI("th","none", "none", "th-TH", "TAJSKI"),
    TURKISH("tr", "Filiz", "standard", "none", "TURECKI"),
    UKRAINIAN("uk","none", "none", "uk-UA", "UKRAIŃSKI"),
    URDU("ur","none", "none", "none", "URDU"),
    UZBEK("uz","none", "none", "none", "UZBECKI"),
    VIETNAMESE("vi","none", "none", "vi-VN", "WIETNAMSKI"),
    WELSH("cy", "Gwyneth", "standard", "none", "WALISKI");

    private final String languageCode;
    private final String voiceId;
    private final String engine;
    private final String transcribeLangCode;
    private final String languageNamePL;

    SupportedLanguage(String languageCode, String voiceId, String engine, String transcribeLangCode, String languageNamePL) {
        this.languageCode = languageCode;
        this.voiceId = voiceId;
        this.engine = engine;
        this.transcribeLangCode = transcribeLangCode;
        this.languageNamePL = languageNamePL;
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

