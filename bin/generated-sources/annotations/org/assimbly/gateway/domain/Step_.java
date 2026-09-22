package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import org.assimbly.gateway.domain.enumeration.StepType;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Step}
 **/
@StaticMetamodel(Step.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Step_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #name
	 **/
	public static final String NAME = "name";
	
	/**
	 * @see #stepType
	 **/
	public static final String STEP_TYPE = "stepType";
	
	/**
	 * @see #componentType
	 **/
	public static final String COMPONENT_TYPE = "componentType";
	
	/**
	 * @see #uri
	 **/
	public static final String URI = "uri";
	
	/**
	 * @see #options
	 **/
	public static final String OPTIONS = "options";
	
	/**
	 * @see #responseId
	 **/
	public static final String RESPONSE_ID = "responseId";
	
	/**
	 * @see #routeId
	 **/
	public static final String ROUTE_ID = "routeId";
	
	/**
	 * @see #flow
	 **/
	public static final String FLOW = "flow";
	
	/**
	 * @see #connection
	 **/
	public static final String CONNECTION = "connection";
	
	/**
	 * @see #message
	 **/
	public static final String MESSAGE = "message";
	
	/**
	 * @see #links
	 **/
	public static final String LINKS = "links";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Step}
	 **/
	public static volatile EntityType<Step> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#id}
	 **/
	public static volatile SingularAttribute<Step, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#name}
	 **/
	public static volatile SingularAttribute<Step, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#stepType}
	 **/
	public static volatile SingularAttribute<Step, StepType> stepType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#componentType}
	 **/
	public static volatile SingularAttribute<Step, String> componentType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#uri}
	 **/
	public static volatile SingularAttribute<Step, String> uri;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#options}
	 **/
	public static volatile SingularAttribute<Step, String> options;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#responseId}
	 **/
	public static volatile SingularAttribute<Step, Integer> responseId;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#routeId}
	 **/
	public static volatile SingularAttribute<Step, Integer> routeId;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#flow}
	 **/
	public static volatile SingularAttribute<Step, Flow> flow;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#connection}
	 **/
	public static volatile SingularAttribute<Step, Connection> connection;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#message}
	 **/
	public static volatile SingularAttribute<Step, Message> message;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Step#links}
	 **/
	public static volatile SetAttribute<Step, Link> links;

}

