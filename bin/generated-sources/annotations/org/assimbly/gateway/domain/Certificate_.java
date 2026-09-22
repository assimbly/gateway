package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.Instant;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Certificate}
 **/
@StaticMetamodel(Certificate.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Certificate_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #url
	 **/
	public static final String URL = "url";
	
	/**
	 * @see #certificateName
	 **/
	public static final String CERTIFICATE_NAME = "certificateName";
	
	/**
	 * @see #certificateStore
	 **/
	public static final String CERTIFICATE_STORE = "certificateStore";
	
	/**
	 * @see #certificateExpiry
	 **/
	public static final String CERTIFICATE_EXPIRY = "certificateExpiry";
	
	/**
	 * @see #certificateFile
	 **/
	public static final String CERTIFICATE_FILE = "certificateFile";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Certificate}
	 **/
	public static volatile EntityType<Certificate> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Certificate#id}
	 **/
	public static volatile SingularAttribute<Certificate, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Certificate#url}
	 **/
	public static volatile SingularAttribute<Certificate, String> url;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Certificate#certificateName}
	 **/
	public static volatile SingularAttribute<Certificate, String> certificateName;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Certificate#certificateStore}
	 **/
	public static volatile SingularAttribute<Certificate, String> certificateStore;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Certificate#certificateExpiry}
	 **/
	public static volatile SingularAttribute<Certificate, Instant> certificateExpiry;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Certificate#certificateFile}
	 **/
	public static volatile SingularAttribute<Certificate, String> certificateFile;

}

