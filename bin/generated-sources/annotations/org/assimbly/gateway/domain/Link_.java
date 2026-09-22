package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Link}
 **/
@StaticMetamodel(Link.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Link_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #name
	 **/
	public static final String NAME = "name";
	
	/**
	 * @see #bound
	 **/
	public static final String BOUND = "bound";
	
	/**
	 * @see #transport
	 **/
	public static final String TRANSPORT = "transport";
	
	/**
	 * @see #rule
	 **/
	public static final String RULE = "rule";
	
	/**
	 * @see #expression
	 **/
	public static final String EXPRESSION = "expression";
	
	/**
	 * @see #point
	 **/
	public static final String POINT = "point";
	
	/**
	 * @see #format
	 **/
	public static final String FORMAT = "format";
	
	/**
	 * @see #pattern
	 **/
	public static final String PATTERN = "pattern";
	
	/**
	 * @see #step
	 **/
	public static final String STEP = "step";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Link}
	 **/
	public static volatile EntityType<Link> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#id}
	 **/
	public static volatile SingularAttribute<Link, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#name}
	 **/
	public static volatile SingularAttribute<Link, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#bound}
	 **/
	public static volatile SingularAttribute<Link, String> bound;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#transport}
	 **/
	public static volatile SingularAttribute<Link, String> transport;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#rule}
	 **/
	public static volatile SingularAttribute<Link, String> rule;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#expression}
	 **/
	public static volatile SingularAttribute<Link, String> expression;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#point}
	 **/
	public static volatile SingularAttribute<Link, String> point;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#format}
	 **/
	public static volatile SingularAttribute<Link, String> format;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#pattern}
	 **/
	public static volatile SingularAttribute<Link, String> pattern;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Link#step}
	 **/
	public static volatile SingularAttribute<Link, Step> step;

}

