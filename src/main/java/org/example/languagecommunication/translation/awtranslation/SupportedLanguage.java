package org.example.languagecommunication.translation.awtranslation;

import lombok.Getter;

@Getter
public enum SupportedLanguage {
    AFRIKAANS("af","none", "none"),
    ALBANIAN("sq","none", "none"),
    AMHARIC("am","none", "none"),
    ARABIC("ar", "Zeina", "standard"),
    ARMENIAN("hy","none", "none"),
    AZERBAIJANI("az","none", "none"),
    BENGALI("bn","none", "none"),
    BOSNIAN("bs","none", "none"),
    BULGARIAN("bg","none", "none"),
    CATALAN("ca", "Arlet", "neural"),
    CHINESE("zh", "Zhiyu", "standard"),
    CROATIAN("hr","none", "none"),
    CZECH("cs", "Jitka", "neural"),
    DANISH("da", "Naja", "standard"),
    DARI("fa-AF","none", "none"),
    DUTCH("nl", "Lotte", "standard"),
    ENGLISH("en", "Joanna", " neural"),
    ESTONIAN("et","none", "none"),
    FARSI("fa","none", "none"),
    FILIPINO_TAGALOG("tl","none", "none"),
    FINNISH("fi", "Suvi", "neural"),
    FRENCH("fr", "Celine", "standard"),
    FRENCH_CANADA("fr-CA", "Chantal", "neural"),
    GEORGIAN("ka","none", "none"),
    GERMAN("de", "Marlene", "standard"),
    GREEK("el","none", "none"),
    GUJARATI("gu","none", "none"),
    HAITIAN_CREOLE("ht","none", "none"),
    HAUSA("ha","none", "none"),
    HEBREW("he","none", "none"),
    HINDI("hi", "Aditi", "standard"),
    HUNGARIAN("hu","none", "none"),
    ICELANDIC("is", "Dora", "standard"),
    INDONESIAN("id","none", "none"),
    IRISH("ga","none", "none"),
    ITALIAN("it", "Carla", "standard"),
    JAPANESE("ja", "Mizuki", "standard"),
    KANNADA("kn","none", "none"),
    KAZAKH("kk","none", "none"),
    KOREAN("ko", "Seoyeon", "standard"),
    LATVIAN("lv","none", "none"),
    LITHUANIAN("lt","none", "none"),
    MACEDONIAN("mk","none", "none"),
    MALAY("ms","none", "none"),
    MALAYALAM("ml","none", "none"),
    MALTESE("mt","none", "none"),
    MARATHI("mr","none", "none"),
    MONGOLIAN("mn","none", "none"),
    NORWEGIAN_BOKMAL("no", "Liv", "standard"),
    PASHTO("ps","none", "none"),
    POLISH("pl", "Ewa", "standard"),
    PORTUGUESE_BRAZIL("pt", "Camila", "standard"),
    PORTUGUESE_PORTUGAL("pt-PT", "Ines", "standard"),
    PUNJABI("pa","none", "none"),
    ROMANIAN("ro", "Carmen", "standard"),
    RUSSIAN("ru", "Tatyana", "standard"),
    SERBIAN("sr","none", "none"),
    SINHALA("si","none", "none"),
    SLOVAK("sk","none", "none"),
    SLOVENIAN("sl","none", "none"),
    SOMALI("so", "none", "none"),
    SPANISH("es", "Conchita", "standard"),
    SPANISH_MEXICO("es-MX", "Mia", "standard"),
    SWAHILI("sw","none", "none"),
    SWEDISH("sv", "Astrid", "standard"),
    TAMIL("ta","none", "none"),
    TELUGU("te","none", "none"),
    THAI("th","none", "none"),
    TURKISH("tr", "Filiz", "standard"),
    UKRAINIAN("uk","none", "none"),
    URDU("ur","none", "none"),
    UZBEK("uz","none", "none"),
    VIETNAMESE("vi","none", "none"),
    WELSH("cy", "Gwyneth", "standard"),;

    private final String languageCode;
    private final String voiceId;
    private final String engine;

    SupportedLanguage(String languageCode, String voiceId, String engine) {
        this.languageCode = languageCode;
        this.voiceId = voiceId;
        this.engine = engine;
    }
}

