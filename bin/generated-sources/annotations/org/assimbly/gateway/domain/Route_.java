package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Route}
 **/
@StaticMetamodel(Route.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Route_ {

	
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
	 * @see #content
	 **/
	public static final String CONTENT = "content";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Route}
	 **/
	public static volatile EntityType<Route> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Route#id}
	 **/
	public static volatile SingularAttribute<Route, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Route#name}
	 **/
	public static volatile SingularAttribute<Route, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Route#type}
	 **/
	public static volatile SingularAttribute<Route, String> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Route#content}
	 **/
	public static volatile SingularAttribute<Route, String> content;

}

