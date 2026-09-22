package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.EnvironmentVariables}
 **/
@StaticMetamodel(EnvironmentVariables.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class EnvironmentVariables_ {

	
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
	 * @see #encrypted
	 **/
	public static final String ENCRYPTED = "encrypted";
	
	/**
	 * @see #integration
	 **/
	public static final String INTEGRATION = "integration";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.EnvironmentVariables}
	 **/
	public static volatile EntityType<EnvironmentVariables> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.EnvironmentVariables#id}
	 **/
	public static volatile SingularAttribute<EnvironmentVariables, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.EnvironmentVariables#key}
	 **/
	public static volatile SingularAttribute<EnvironmentVariables, String> key;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.EnvironmentVariables#value}
	 **/
	public static volatile SingularAttribute<EnvironmentVariables, String> value;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.EnvironmentVariables#encrypted}
	 **/
	public static volatile SingularAttribute<EnvironmentVariables, Boolean> encrypted;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.EnvironmentVariables#integration}
	 **/
	public static volatile SingularAttribute<EnvironmentVariables, Integration> integration;

}

