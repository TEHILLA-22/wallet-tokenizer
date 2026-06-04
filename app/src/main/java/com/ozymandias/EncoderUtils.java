package com.ozymandias;

/**
 * Simple XOR-based string obfuscation to avoid static string detection.
 * Not cryptographically secure — just AV/analysis evasion.
 */
public class EncoderUtils {

    private static final byte[] KEY = { 0x5A, 0x3C, 0x1F, 0x6B, 0x2E };

    public static String decode(byte[] encrypted) {
        byte[] decrypted = new byte[encrypted.length];
        for (int i = 0; i < encrypted.length; i++) {
            decrypted[i] = (byte) (encrypted[i] ^ KEY[i % KEY.length]);
        }
        return new String(decrypted);
    }

    // Use this to generate encoded strings during build
    public static byte[] encode(String plaintext) {
        byte[] input = plaintext.getBytes();
        byte[] encoded = new byte[input.length];
        for (int i = 0; i < input.length; i++) {
            encoded[i] = (byte) (input[i] ^ KEY[i % KEY.length]);
        }
        return encoded;
    }
}