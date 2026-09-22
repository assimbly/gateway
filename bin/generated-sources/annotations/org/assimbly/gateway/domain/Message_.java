package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Message}
 **/
@StaticMetamodel(Message.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Message_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #name
	 **/
	public static final String NAME = "name";
	
	/**
	 * @see #body
	 **/
	public static final String BODY = "body";
	
	/**
	 * @see #language
	 **/
	public static final String LANGUAGE = "language";
	
	/**
	 * @see #headers
	 **/
	public static final String HEADERS = "headers";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Message}
	 **/
	public static volatile EntityType<Message> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Message#id}
	 **/
	public static volatile SingularAttribute<Message, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Message#name}
	 **/
	public static volatile SingularAttribute<Message, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Message#body}
	 **/
	public static volatile SingularAttribute<Message, String> body;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Message#language}
	 **/
	public static volatile SingularAttribute<Message, String> language;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Message#headers}
	 **/
	public static volatile SetAttribute<Message, Header> headers;

}

