package org.example.languagecommunication.common.utils;

import org.apache.commons.codec.digest.DigestUtils;

public class Hasher {
    public static String hash(String token) {
        return DigestUtils.sha256Hex(token);
    }
}
