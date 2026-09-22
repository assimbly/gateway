package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.LocalDate;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.PersistentToken}
 **/
@StaticMetamodel(PersistentToken.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class PersistentToken_ {

	
	/**
	 * @see #series
	 **/
	public static final String SERIES = "series";
	
	/**
	 * @see #tokenValue
	 **/
	public static final String TOKEN_VALUE = "tokenValue";
	
	/**
	 * @see #tokenDate
	 **/
	public static final String TOKEN_DATE = "tokenDate";
	
	/**
	 * @see #ipAddress
	 **/
	public static final String IP_ADDRESS = "ipAddress";
	
	/**
	 * @see #userAgent
	 **/
	public static final String USER_AGENT = "userAgent";
	
	/**
	 * @see #user
	 **/
	public static final String USER = "user";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.PersistentToken}
	 **/
	public static volatile EntityType<PersistentToken> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentToken#series}
	 **/
	public static volatile SingularAttribute<PersistentToken, String> series;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentToken#tokenValue}
	 **/
	public static volatile SingularAttribute<PersistentToken, String> tokenValue;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentToken#tokenDate}
	 **/
	public static volatile SingularAttribute<PersistentToken, LocalDate> tokenDate;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentToken#ipAddress}
	 **/
	public static volatile SingularAttribute<PersistentToken, String> ipAddress;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentToken#userAgent}
	 **/
	public static volatile SingularAttribute<PersistentToken, String> userAgent;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentToken#user}
	 **/
	public static volatile SingularAttribute<PersistentToken, User> user;

}

