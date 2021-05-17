package org.assimbly.gateway.config;

import org.apache.commons.cli.*;
import org.apache.commons.io.FileUtils;
import org.assimbly.gateway.GatewayApp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;

/**
 * Utility class to parse and handle custom command line arguments
 */
public final class CommandsUtil {

    private static final Logger log = LoggerFactory.getLogger(CommandsUtil.class);

    private final static String userHomeDir = System.getProperty("user.home");

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

        Option backup = new Option("b", "backup", true, "backup dir file path");
        backup.setRequired(false);
        options.addOption(backup);

        Option restore = new Option("r", "restore", true, "restore from back dir file path");
        restore.setRequired(false);
        options.addOption(restore);

        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();
        CommandLine cmd = null;

        try {
            cmd = parser.parse(options, args);
        } catch (ParseException e) {
        	return true;
        }

        String baseDirectoryParam = cmd.getOptionValue("application.gateway.base-directory");
        String cleanParam = cmd.getOptionValue("clean");
        String backupDirectoryParam = cmd.getOptionValue("backup");
        String restoreDirectoryParam = cmd.getOptionValue("restore");

        if(baseDirectoryParam == null || baseDirectoryParam.equalsIgnoreCase("default")){
                if(isWindows()) {
                    baseDirectoryParam = userHomeDir + "\\.assimbly";
                }else {
                    baseDirectoryParam = userHomeDir + "/.assimbly";
                }
        }else{
            System.setProperty("user.home",baseDirectoryParam);
        }

        if(cleanParam!=null && cleanParam.equalsIgnoreCase("true")){
            clean(baseDirectoryParam);
            return false;
        }

        if(backupDirectoryParam!=null){
            backup(baseDirectoryParam, backupDirectoryParam);
            return false;
        }

        if(restoreDirectoryParam!=null){
            restore(restoreDirectoryParam, baseDirectoryParam);
            return false;
        }

        return true;
    }

    private static void clean(String sourceDirectory) {
        try{
            File sourceDirectoryFile = new File(sourceDirectory);
            FileUtils.deleteDirectory(sourceDirectoryFile);
            log.info("Deleted Gateway base-directory.");
            log.info("Base-Directory=" + sourceDirectory);
        }catch (IOException e) {
            log.error("Error clean gateway: " + e.getCause());
        }
    }

    private static void backup(String sourceDirectory, String destinationDirectory) {
        try{
            File sourceDirectoryFile = new File(sourceDirectory);
            File destinationDirectoryFile = new File(destinationDirectory);
            FileUtils.copyDirectory(sourceDirectoryFile, destinationDirectoryFile);
            log.info("Backuped gateway.");
            log.info("Backup-Directory=" + destinationDirectory);
            log.info("Base-Directory=" + sourceDirectory);
        }catch (IOException e) {
            log.error("Error backup gateway: " + e.getCause());
        }
    }

    private static void restore(String sourceDirectory, String destinationDirectory) {
        try{
            File sourceDirectoryFile = new File(sourceDirectory);
            File destinationDirectoryFile = new File(destinationDirectory);
            FileUtils.deleteDirectory(destinationDirectoryFile);
            FileUtils.copyDirectory(sourceDirectoryFile, destinationDirectoryFile);
            log.info("Restored gateway.");
            log.info("Restore-Directory=" + sourceDirectory);
            log.info("Base-Directory=" + destinationDirectory);
        }catch (IOException e) {
            log.error("Error restore gateway: " + e.getCause());
        }
    }

    public static boolean isWindows()
    {
        String OS = System.getProperty("os.name");
        return OS.startsWith("Windows");
    }

}
