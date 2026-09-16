package org.assimbly.gateway.config;

import org.apache.commons.cli.*;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Utility class to parse and handle custom command line arguments
 */
public final class CommandsUtil {

    private static final Logger log = LoggerFactory.getLogger(CommandsUtil.class);

    private static final String USER_HOME_DIR = System.getProperty("user.home");

    private CommandsUtil() {
    }

    public static boolean parseParameters(String[] args) {

        Options options = new Options();

        Option baseDirectory = new Option("d", "application.gateway.base-directory", true, "Set base-directory to store logs, alerts etc)");
        baseDirectory.setRequired(false);
        options.addOption(baseDirectory);

        Option clean = new Option("c", "clean", true, "If true deletes the assimbly base directory (you may create a backup or export first)");
        clean.setRequired(false);
        options.addOption(clean);

        Option cleandb = new Option("cdb", "cleandb", true, "If true deletes the assimbly base directory (you may create a backup or export first)");
        clean.setRequired(false);
        options.addOption(cleandb);

        Option backup = new Option("b", "backup", true, "backup dir file path");
        backup.setRequired(false);
        options.addOption(backup);

        Option restore = new Option("r", "restore", true, "restore from back dir file path");
        restore.setRequired(false);
        options.addOption(restore);

        CommandLineParser parser = new DefaultParser();
        CommandLine cmd = null;

        String[] arguments = getArguments(args);

        try {
            cmd = parser.parse(options, arguments, true);

            String baseDirectoryParam = cmd.getOptionValue("application.gateway.base-directory");
            String cleanParam = cmd.getOptionValue("clean");
            String cleandbParam = cmd.getOptionValue("cleandb");
            String backupDirectoryParam = cmd.getOptionValue("backup");
            String restoreDirectoryParam = cmd.getOptionValue("restore");

            if(baseDirectoryParam == null || baseDirectoryParam.equalsIgnoreCase("default")){
                baseDirectoryParam = USER_HOME_DIR;
            }

            System.setProperty("user.home",baseDirectoryParam);

            String assimblyDirectory = baseDirectoryParam + "/.assimbly";

            if(cleanParam!=null && cleanParam.equalsIgnoreCase("true")){
                clean(assimblyDirectory);
                return false;
            }

            if(cleandbParam!=null && cleandbParam.equalsIgnoreCase("true")){
                cleandb(assimblyDirectory);
                return false;
            }

            if(backupDirectoryParam!=null){
                backup(assimblyDirectory, backupDirectoryParam);
                return false;
            }

            if(restoreDirectoryParam!=null){
                restore(restoreDirectoryParam, assimblyDirectory);
                return false;
            }

            return true;

        } catch (ParseException _) {
            return false;
        }

    }

    private static void clean(String sourceDirectory) {
        try{
            File sourceDirectoryFile = new File(sourceDirectory);
            File databaseDirectory = new File(sourceDirectory + "/db");

            //only delete when directory contains an existing assimbly database
            if(databaseDirectory.exists()) {
                FileUtils.deleteDirectory(sourceDirectoryFile);
                log.info("Deleted Gateway base-directory.");
                log.info("Base-Directory=" + sourceDirectory);
            }
        }catch (IOException e) {
            log.error("Error clean gateway: " + e.getCause());
        }
    }

    private static void cleandb(String sourceDirectory) {
        try{
            File databaseDirectory = new File(sourceDirectory + "/db");

            //only delete when directory contains an existing assimbly database
            if(databaseDirectory.exists()) {
                FileUtils.deleteDirectory(databaseDirectory);
                log.info("Deleted Gateway database.");
                log.info("Base-Directory=" + sourceDirectory);
            }
        }catch (IOException e) {
            log.error("Error clean gateway database: " + e.getCause());
        }
    }

    private static void backup(String sourceDirectory, String destinationDirectory) {
        try{
            File sourceDirectoryFile = new File(sourceDirectory);
            File destinationDirectoryFile = new File(destinationDirectory);
            FileUtils.copyDirectory(sourceDirectoryFile, destinationDirectoryFile);
            log.info("Backuped gateway.");
            log.info("Backup-Directory={}", destinationDirectory);
            log.info("Base-Directory={}", sourceDirectory);
        }catch (IOException e) {
            log.error("Error backup gateway: {}", String.valueOf(e.getCause()));
        }
    }

    private static void restore(String sourceDirectory, String destinationDirectory) {
        try{
            File sourceDirectoryFile = new File(sourceDirectory);
            File destinationDirectoryFile = new File(destinationDirectory);
            FileUtils.deleteDirectory(destinationDirectoryFile);
            FileUtils.copyDirectory(sourceDirectoryFile, destinationDirectoryFile);
            log.info("Restored gateway.");
            log.info("Restore-Directory={}", sourceDirectory);
            log.info("Base-Directory={}", destinationDirectory);
        }catch (IOException e) {
            log.error("Error restore gateway: {}", String.valueOf(e.getCause()));
        }
    }

    private static String[] getArguments(String[] args) {
        List<String> arguments = Arrays.stream(args)
            .filter(CommandsUtil::isRelevantArgument)
            .toList();

        return arguments.isEmpty() ? null : arguments.toArray(String[]::new);
    }

    private static boolean isRelevantArgument(String arg) {
        return arg.startsWith("-d=")
            || arg.startsWith("--application.gateway.base-directory=")
            || arg.startsWith("-c=")
            || arg.startsWith("--clean=")
            || arg.startsWith("-b=")
            || arg.startsWith("--backup=")
            || arg.startsWith("-r=")
            || arg.startsWith("--restore=");
    }

}
