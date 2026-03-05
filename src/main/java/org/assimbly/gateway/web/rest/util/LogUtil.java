package org.assimbly.gateway.web.rest.util;

import java.io.File;
import java.io.IOException;

public class LogUtil {

	public static String tail(File file, int lines) {

	    try(java.io.RandomAccessFile fileHandler = new java.io.RandomAccessFile( file, "r" )) {

	        long fileLength = fileHandler.length() - 1;
	        StringBuilder sb = new StringBuilder();
	        int line = 0;

	        for(long filePointer = fileLength; filePointer != -1; filePointer--){
	            fileHandler.seek( filePointer );
	            int readByte = fileHandler.readByte();

	             if( readByte == 0xA ) {
	                if (filePointer < fileLength) {
	                    line = line + 1;
	                }
	            } else if( readByte == 0xD && filePointer < fileLength-1) {
	                    line = line + 1;
	                }

                if (line >= lines) {
	                break;
	            }
	            sb.append( ( char ) readByte );
	        }

	        return sb.reverse().toString();

	    } catch( IOException _ ) {
	        return null;
	    }
	}
}
