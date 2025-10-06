package com.bookwebAI.order_service.util;

public final class CodeGenerator {
    private CodeGenerator() {}
    public static String gen(String prefix) {
        String s = String.valueOf(System.currentTimeMillis());
        return prefix + "-" + s.substring(Math.max(0, s.length() - 6));
    }
}