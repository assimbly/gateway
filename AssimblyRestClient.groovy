import groovy.json.JsonSlurper
public class RestClient {
  private def baseUrl
  private CookieManager cookieManager
  private XXSRFTOKEN
  
  public RestClient(def baseUrl='http://localhost:8090') {
    this.baseUrl = baseUrl
	this.cookieManager = new CookieManager();
  }

  def get(def path) {
	println "GETTING:"+ baseUrl+path
    def responseText = ""
	def conn = null
	  try {
        conn = new URL(baseUrl+path).openConnection();
		if (cookieManager.getCookieStore().getCookies().size() > 0) {
			// While joining the Cookies, use ',' or ';' as needed. Most of the servers are using ';'
			conn.setRequestProperty("Cookie", (cookieManager.getCookieStore().getCookies()).join(","));    
		}
		
        conn.setRequestMethod("GET")
		conn.setRequestProperty( 'Accept', 'application/json, text/plain, */*' )
        conn.setRequestProperty("Content-Type", "application/json")
		conn.setRequestProperty("X-XSRF-TOKEN", this.XXSRFTOKEN)
        conn.setDoOutput(false)
        def postRC = conn.getResponseCode();
		CookieHandler.setDefault(cookieManager);
		Map<String, List<String>> headerFields = conn.getHeaderFields();
		List<String> cookiesHeader = headerFields.get("Set-Cookie");
		String[] rawCookieNameAndValue 
		if (cookiesHeader != null) {
			for (String cookie : cookiesHeader) {
				cookieManager.getCookieStore().add(null,HttpCookie.parse(cookie).get(0));
				if (HttpCookie.parse(cookie)[0].getName()== 'XSRF-TOKEN' ){
					this.XXSRFTOKEN = HttpCookie.parse(cookie)[0].getValue()
				}
			}               
		}
        responseText = conn.getInputStream().getText()
      } catch (ignored) {
		println "ERROR in " + baseUrl+path
		println conn.getErrorStream().getText()
	  }finally {
        conn.disconnect()
      }
	  try {
		def jsonSlurper = new JsonSlurper().parseText(responseText)
		return jsonSlurper		
	  } catch (ignored) {
		println "NO_JSON_RESPONSE" +responseText
		return responseText
	  }
  }
  
  
  def post(path='', formDataHashMap){
	def responseText = ""
    def conn = null
	
	Set set = formDataHashMap.entrySet();
	Iterator i = set.iterator();
	StringBuilder postData = new StringBuilder();
	for (Map.Entry<String, String> param : formDataHashMap.entrySet()) {
		if (postData.length() != 0) {
			postData.append('&');
		}
		postData.append(URLEncoder.encode(param.getKey(), "UTF-8"));
		postData.append('=');
		postData.append(URLEncoder.encode(String.valueOf(param.getValue()), "UTF-8"));
	}
	byte[] postDataBytes = postData.toString().getBytes("UTF-8");
	println postData.toString()

    try {
		conn = new URL(baseUrl+path).openConnection();
		conn.setDoOutput(true)
		if (cookieManager.getCookieStore().getCookies().size() > 0) {
			// While joining the Cookies, use ',' or ';' as needed. Most of the servers are using ';'
			conn.setRequestProperty("Cookie", (cookieManager.getCookieStore().getCookies()).join(","));    
		}
		
		conn.setRequestMethod("POST")
		conn.setRequestProperty("X-XSRF-TOKEN", this.XXSRFTOKEN)
		
		conn.setRequestProperty( 'Accept', 'application/json, text/plain, */*' )
		conn.setRequestProperty( 'Content-Type', 'application/x-www-form-urlencoded' )
		
		conn.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));
		conn.getOutputStream().write(postDataBytes);
        
        
        def postRC = conn.getResponseCode();
		CookieHandler.setDefault(cookieManager);
		Map<String, List<String>> headerFields = conn.getHeaderFields();
		List<String> cookiesHeader = headerFields.get("Set-Cookie");
		
		if (cookiesHeader != null) {
			for (String cookie : cookiesHeader) {
				cookieManager.getCookieStore().add(null,HttpCookie.parse(cookie).get(0));
			}               
		}
        responseText = conn.getInputStream().getText()
        println "Got: " + postRC + "\n"+responseText
    } catch (ignored) {
		
		println conn.getResponseCode();
	}
	finally {
        conn.disconnect()
		try {
			println groovy.json.JsonSlurperClassic().parseText(responseText).toPrettyString();
			return new groovy.json.JsonSlurperClassic().parseText(responseText)
		} catch (ignored) {
			println responseText
		}
    }
  }
}
