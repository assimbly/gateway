package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.Instant;
import org.assimbly.gateway.domain.enumeration.LogLevelType;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Flow}
 **/
@StaticMetamodel(Flow.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Flow_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #name
	 **/
	public static final String NAME = "name";
	
	/**
	 * @see #autoStart
	 **/
	public static final String AUTO_START = "autoStart";
	
	/**
	 * @see #maximumRedeliveries
	 **/
	public static final String MAXIMUM_REDELIVERIES = "maximumRedeliveries";
	
	/**
	 * @see #redeliveryDelay
	 **/
	public static final String REDELIVERY_DELAY = "redeliveryDelay";
	
	/**
	 * @see #type
	 **/
	public static final String TYPE = "type";
	
	/**
	 * @see #notes
	 **/
	public static final String NOTES = "notes";
	
	/**
	 * @see #loadBalancing
	 **/
	public static final String LOAD_BALANCING = "loadBalancing";
	
	/**
	 * @see #parallelProcessing
	 **/
	public static final String PARALLEL_PROCESSING = "parallelProcessing";
	
	/**
	 * @see #logLevel
	 **/
	public static final String LOG_LEVEL = "logLevel";
	
	/**
	 * @see #instances
	 **/
	public static final String INSTANCES = "instances";
	
	/**
	 * @see #version
	 **/
	public static final String VERSION = "version";
	
	/**
	 * @see #created
	 **/
	public static final String CREATED = "created";
	
	/**
	 * @see #lastModified
	 **/
	public static final String LAST_MODIFIED = "lastModified";
	
	/**
	 * @see #integration
	 **/
	public static final String INTEGRATION = "integration";
	
	/**
	 * @see #steps
	 **/
	public static final String STEPS = "steps";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Flow}
	 **/
	public static volatile EntityType<Flow> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#id}
	 **/
	public static volatile SingularAttribute<Flow, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#name}
	 **/
	public static volatile SingularAttribute<Flow, String> name;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#autoStart}
	 **/
	public static volatile SingularAttribute<Flow, Boolean> autoStart;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#maximumRedeliveries}
	 **/
	public static volatile SingularAttribute<Flow, Integer> maximumRedeliveries;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#redeliveryDelay}
	 **/
	public static volatile SingularAttribute<Flow, Integer> redeliveryDelay;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#type}
	 **/
	public static volatile SingularAttribute<Flow, String> type;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#notes}
	 **/
	public static volatile SingularAttribute<Flow, String> notes;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#loadBalancing}
	 **/
	public static volatile SingularAttribute<Flow, Boolean> loadBalancing;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#parallelProcessing}
	 **/
	public static volatile SingularAttribute<Flow, Boolean> parallelProcessing;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#logLevel}
	 **/
	public static volatile SingularAttribute<Flow, LogLevelType> logLevel;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#instances}
	 **/
	public static volatile SingularAttribute<Flow, Integer> instances;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#version}
	 **/
	public static volatile SingularAttribute<Flow, Integer> version;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#created}
	 **/
	public static volatile SingularAttribute<Flow, Instant> created;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#lastModified}
	 **/
	public static volatile SingularAttribute<Flow, Instant> lastModified;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#integration}
	 **/
	public static volatile SingularAttribute<Flow, Integration> integration;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Flow#steps}
	 **/
	public static volatile SetAttribute<Flow, Step> steps;

}

