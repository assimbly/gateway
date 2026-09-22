package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Header}
 **/
@StaticMetamodel(Header.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Header_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #key
	 **/
	public static final String KEY = "key";
	
	/**
	 * @see #value
	 **/
	public static final String VALUE = "value";
	
	/**
	 * @see #type
	 **/
	public static final String TYPE = "type";
	
	/**
	 * @see #language
	 **/
	public static final String LANGUAGE = "language";
	
	/**
	 * @see #message
	 **/
	public static final String MESSAGE = "message";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Header}
	 **/
	public static volatile EntityType<Header> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Header#id}
	 **/
	public static volatile SingularAttribute<Header, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Header#key}
	 **/
	public static volatile SingularAttribute<Header, String> key;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Header#value}
	 **/
	public static volatile SingularAttribute<Header, String> value;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Header#type}
	 **/
	public static volatile SingularAttribute<Header, String> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Header#language}
	 **/
	public static volatile SingularAttribute<Header, String> language;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Header#message}
	 **/
	public static volatile SingularAttribute<Header, Message> message;

}

