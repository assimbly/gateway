package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import org.assimbly.gateway.domain.enumeration.ConnectorType;
import org.assimbly.gateway.domain.enumeration.EnvironmentType;
import org.assimbly.gateway.domain.enumeration.GatewayType;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Integration}
 **/
@StaticMetamodel(Integration.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Integration_ {

	
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
	 * @see #environmentName
	 **/
	public static final String ENVIRONMENT_NAME = "environmentName";
	
	/**
	 * @see #stage
	 **/
	public static final String STAGE = "stage";
	
	/**
	 * @see #connectorType
	 **/
	public static final String CONNECTOR_TYPE = "connectorType";
	
	/**
	 * @see #defaultFromComponentType
	 **/
	public static final String DEFAULT_FROM_COMPONENT_TYPE = "defaultFromComponentType";
	
	/**
	 * @see #defaultToComponentType
	 **/
	public static final String DEFAULT_TO_COMPONENT_TYPE = "defaultToComponentType";
	
	/**
	 * @see #defaultErrorComponentType
	 **/
	public static final String DEFAULT_ERROR_COMPONENT_TYPE = "defaultErrorComponentType";
	
	/**
	 * @see #flows
	 **/
	public static final String FLOWS = "flows";
	
	/**
	 * @see #environmentVariables
	 **/
	public static final String ENVIRONMENT_VARIABLES = "environmentVariables";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Integration}
	 **/
	public static volatile EntityType<Integration> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#id}
	 **/
	public static volatile SingularAttribute<Integration, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#name}
	 **/
	public static volatile SingularAttribute<Integration, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#type}
	 **/
	public static volatile SingularAttribute<Integration, GatewayType> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#environmentName}
	 **/
	public static volatile SingularAttribute<Integration, String> environmentName;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#stage}
	 **/
	public static volatile SingularAttribute<Integration, EnvironmentType> stage;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#connectorType}
	 **/
	public static volatile SingularAttribute<Integration, ConnectorType> connectorType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#defaultFromComponentType}
	 **/
	public static volatile SingularAttribute<Integration, String> defaultFromComponentType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#defaultToComponentType}
	 **/
	public static volatile SingularAttribute<Integration, String> defaultToComponentType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#defaultErrorComponentType}
	 **/
	public static volatile SingularAttribute<Integration, String> defaultErrorComponentType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#flows}
	 **/
	public static volatile SetAttribute<Integration, Flow> flows;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Integration#environmentVariables}
	 **/
	public static volatile SetAttribute<Integration, EnvironmentVariables> environmentVariables;

}

