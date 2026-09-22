package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Broker}
 **/
@StaticMetamodel(Broker.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Broker_ {

	
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
	 * @see #configurationType
	 **/
	public static final String CONFIGURATION_TYPE = "configurationType";
	
	/**
	 * @see #autoStart
	 **/
	public static final String AUTO_START = "autoStart";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Broker}
	 **/
	public static volatile EntityType<Broker> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Broker#id}
	 **/
	public static volatile SingularAttribute<Broker, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Broker#name}
	 **/
	public static volatile SingularAttribute<Broker, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Broker#type}
	 **/
	public static volatile SingularAttribute<Broker, String> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Broker#configurationType}
	 **/
	public static volatile SingularAttribute<Broker, String> configurationType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Broker#autoStart}
	 **/
	public static volatile SingularAttribute<Broker, Boolean> autoStart;

}

