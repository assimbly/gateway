package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.ConnectionKeys}
 **/
@StaticMetamodel(ConnectionKeys.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class ConnectionKeys_ {

	
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
	 * @see #connection
	 **/
	public static final String CONNECTION = "connection";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.ConnectionKeys}
	 **/
	public static volatile EntityType<ConnectionKeys> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.ConnectionKeys#id}
	 **/
	public static volatile SingularAttribute<ConnectionKeys, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.ConnectionKeys#key}
	 **/
	public static volatile SingularAttribute<ConnectionKeys, String> key;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.ConnectionKeys#value}
	 **/
	public static volatile SingularAttribute<ConnectionKeys, String> value;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.ConnectionKeys#type}
	 **/
	public static volatile SingularAttribute<ConnectionKeys, String> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.ConnectionKeys#connection}
	 **/
	public static volatile SingularAttribute<ConnectionKeys, Connection> connection;

}

