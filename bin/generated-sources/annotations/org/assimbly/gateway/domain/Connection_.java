package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Connection}
 **/
@StaticMetamodel(Connection.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Connection_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #name
	 **/
	public static final String NAME = "name";
	
	/**
	 * @see #type
	 **/
	public static final String TYPE = "type";
	
	/**
	 * @see #connectionKeys
	 **/
	public static final String CONNECTION_KEYS = "connectionKeys";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Connection}
	 **/
	public static volatile EntityType<Connection> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Connection#id}
	 **/
	public static volatile SingularAttribute<Connection, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Connection#name}
	 **/
	public static volatile SingularAttribute<Connection, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Connection#type}
	 **/
	public static volatile SingularAttribute<Connection, String> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Connection#connectionKeys}
	 **/
	public static volatile SetAttribute<Connection, ConnectionKeys> connectionKeys;

}

