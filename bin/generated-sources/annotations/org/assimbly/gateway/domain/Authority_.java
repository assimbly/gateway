package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Authority}
 **/
@StaticMetamodel(Authority.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Authority_ {

	
	/**
	 * @see #name
	 **/
	public static final String NAME = "name";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Authority}
	 **/
	public static volatile EntityType<Authority> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Authority#name}
	 **/
	public static volatile SingularAttribute<Authority, String> name;

}

