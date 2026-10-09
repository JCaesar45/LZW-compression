package com.lzwsuit.core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LZW codec — thread-safe, stateless.
 * Reference: Welch, T. A. (1984). Computer, 17(6), 8-19.
 */
public final class LzwCodec {

    private static final int INITIAL_DICT_SIZE = 256;

    private LzwCodec() { /* utility class */ }

    public static List<Integer> compress(String input) {
        if (input == null) {
            throw new IllegalArgumentException("input must not be null");
        }

        Map<String, Integer> dict = new HashMap<>();
        for (int i = 0; i < INITIAL_DICT_SIZE; i++) {
            dict.put(String.valueOf((char) i), i);
        }

        int next = INITIAL_DICT_SIZE;
        List<Integer> out = new ArrayList<>();
        StringBuilder w = new StringBuilder();

        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            String wc = w.toString() + c;

            if (dict.containsKey(wc)) {
                w.append(c);
            } else {
                out.add(dict.get(w.toString()));
                dict.put(wc, next++);
                w.setLength(0);
                w.append(c);
            }
        }

        if (w.length() > 0) {
            out.add(dict.get(w.toString()));
        }

        return out;
    }

    public static String decompress(List<Integer> codes) {
        if (codes == null) {
            throw new IllegalArgumentException("codes must not be null");
        }
        if (codes.isEmpty()) {
            return "";
        }

        Map<Integer, String> dict = new HashMap<>();
        for (int i = 0; i < INITIAL_DICT_SIZE; i++) {
            dict.put(i, String.valueOf((char) i));
        }

        int next = INITIAL_DICT_SIZE;
        String w = dict.get(codes.get(0));
        StringBuilder out = new StringBuilder(w);

        for (int i = 1; i < codes.size(); i++) {
            int k = codes.get(i);
            String entry;

            if (dict.containsKey(k)) {
                entry = dict.get(k);
            } else if (k == next) {
                entry = w + w.charAt(0);
            } else {
                throw new IllegalArgumentException("invalid LZW code: " + k);
            }

            out.append(entry);
            dict.put(next++, w + entry.charAt(0));
            w = entry;
        }

        return out.toString();
    }
}
