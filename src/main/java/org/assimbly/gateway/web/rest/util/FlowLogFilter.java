package org.assimbly.gateway.web.rest.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.regex.Pattern;

/**
 * The entries of one Flow in the application log. An entry is a line that starts with a timestamp, together with the
 * lines after it that don't (an Exchange body, a stack trace).
 */
public final class FlowLogFilter {

    private static final Pattern ENTRY_START = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}");

    /** Where the logger column ends in Spring Boot's pattern: {@code [thread] logger : message}. */
    private static final String LOGGER_END = " : ";

    private final Pattern logger;
    private final Pattern lifecycle;

    /**
     * An entry belongs to the Flow when its first line has, in the logger column, {@code org.assimbly.runtime.<id>}
     * (Log Steps), {@code org.assimbly.errorhandler.<id>} (failed deliveries) or {@code <FlowName>/<id>} (a logging
     * Error Handler; a long name is cut from the left, so the id stays), or in its message {@code flowid=<id>}
     * (starting, stopping and loading the Flow).
     */
    FlowLogFilter(long flowId) {
        String id = Pattern.quote(Long.toString(flowId));
        logger = Pattern.compile("(?:org\\.assimbly\\.(?:runtime|errorhandler)\\.|/)" + id + "\\s+:\\s$");
        lifecycle = Pattern.compile("\\bflowid=" + id + "\\b");
    }

    /** The last {@code entries} entries of the Flow in the log file, oldest first, or null when it can't be read. */
    public static String tail(File file, long flowId, int entries) {
        try (BufferedReader reader = Files.newBufferedReader(file.toPath(), StandardCharsets.UTF_8)) {
            return new FlowLogFilter(flowId).tail(reader, entries);
        } catch (IOException _) {
            return null;
        }
    }

    String tail(BufferedReader reader, int entries) throws IOException {
        Deque<String> kept = new ArrayDeque<>();
        StringBuilder entry = null;
        String line;
        while ((line = reader.readLine()) != null) {
            if (ENTRY_START.matcher(line).find()) {
                keep(kept, entry, entries);
                entry = matches(line) ? new StringBuilder(line) : null;
            } else if (entry != null) {
                entry.append('\n').append(line);
            }
        }
        keep(kept, entry, entries);
        return String.join("\n", kept);
    }

    boolean matches(String line) {
        int end = line.indexOf(LOGGER_END);
        if (end > 0 && logger.matcher(line.substring(0, end + LOGGER_END.length())).find()) {
            return true;
        }
        return lifecycle.matcher(line).find();
    }

    private static void keep(Deque<String> kept, StringBuilder entry, int entries) {
        if (entry == null || entries < 1) {
            return;
        }
        kept.addLast(entry.toString());
        if (kept.size() > entries) {
            kept.removeFirst();
        }
    }
}
