package com.lzwsuit.api;

import com.lzwsuit.core.LzwCodec;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LzwController {

    @PostMapping("/compress")
    public ResponseEntity<Map<String, Object>> compress(
            @RequestBody Map<String, String> body) {
        String data = body.get("data");
        if (data == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "field 'data' is required"));
        }
        List<Integer> codes = LzwCodec.compress(data);
        return ResponseEntity.ok(Map.of("codes", codes, "size", codes.size()));
    }

    @PostMapping("/decompress")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> decompress(
            @RequestBody Map<String, Object> body) {
        Object raw = body.get("codes");
        if (!(raw instanceof List<?> list)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "field 'codes' must be an array"));
        }
        List<Integer> codes = (List<Integer>) list;
        try {
            String data = LzwCodec.decompress(codes);
            return ResponseEntity.ok(Map.of("data", data, "size", data.length()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
