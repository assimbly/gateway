package org.assimbly.gateway.config.flows;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.apache.commons.configuration2.XMLConfiguration;
import org.apache.commons.configuration2.ex.ConfigurationException;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;

import java.io.StringWriter;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;


public final class ConvertUtil {

	public static int PRETTY_PRINT_INDENT_FACTOR = 4;
	   
    public static String convertStreamToString(InputStream is) {
        @SuppressWarnings("resource")
		java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

    public static InputStream convertStringToStream(String str) throws UnsupportedEncodingException {
        return new ByteArrayInputStream(str.getBytes("UTF-8"));
    }

	public static Document convertStringToDoc(String str) throws Exception {
		
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();

	    return builder.parse(new ByteArrayInputStream(str.getBytes()));
	  }
    
	public static String convertDocToString(Document doc) {
	    try {
	        StringWriter sw = new StringWriter();
	        TransformerFactory tf = TransformerFactory.newInstance();
	        Transformer transformer = tf.newTransformer();
	        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
	        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
	        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

	        transformer.transform(new DOMSource(doc), new StreamResult(sw));
	        return sw.toString();
	    } catch (Exception ex) {
	        throw new RuntimeException("Error converting to String", ex);
	    }
	}

	public static Document convertUriToDoc(URI uri) throws Exception {
		
	   URL url = uri.toURL(); //get URL from your uri object
	   InputStream stream = url.openStream();
		
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();

	    return builder.parse(stream);
	  }
    
	public static boolean isValidUri(String name) throws Exception {
		try {
		    URI uri = new URI(name);
		    
		    if(uri.getScheme() == null){
		    	return false;
		    }else{ 
		    	return true;
		    }
		    
		} catch (URISyntaxException e) {
			return false;
		}
		
	}	
    
	public static List<String> getXMLParameters(XMLConfiguration conf, String prefix) throws ConfigurationException {
	  	   
	  	   Iterator<String> keys;
	  	   
	  	   if(prefix == null || prefix.isEmpty()){
	  		 keys = conf.getKeys();
	  	   }else{
	  		 keys = conf.getKeys(prefix);
	  	   }
	  	     
	  	   List<String> keyList = new ArrayList<String>();
	    
	  	   while(keys.hasNext()){
	  		   keyList.add(keys.next());
	  	   }

	  	   return keyList;
	}

	public static void printTreemap(TreeMap<String, String> treeMap) throws Exception {
		
		for(Map.Entry<String,String> entry : treeMap.entrySet()) {

			  String key = entry.getKey();
			  String value = entry.getValue();

			  System.out.println(key + " => " + value);
		}
		
	}

	public static String convertJsonToXml(String json) throws JSONException {

	   JSONObject jsonObj = new JSONObject(json);
	   String xml = XML.toString(jsonObj);

	   return xml;
		
	}
	
	public static String convertXmlToJson(String xml) throws JSONException {
		
        JSONObject xmlJSONObj = XML.toJSONObject(xml);
        String json = xmlJSONObj.toString(PRETTY_PRINT_INDENT_FACTOR);
		
		return json;		
	}

}
