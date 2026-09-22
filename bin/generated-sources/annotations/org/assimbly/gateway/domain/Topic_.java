package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Topic}
 **/
@StaticMetamodel(Topic.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Topic_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #itemsOnPage
	 **/
	public static final String ITEMS_ON_PAGE = "itemsOnPage";
	
	/**
	 * @see #refreshInterval
	 **/
	public static final String REFRESH_INTERVAL = "refreshInterval";
	
	/**
	 * @see #selectedColumn
	 **/
	public static final String SELECTED_COLUMN = "selectedColumn";
	
	/**
	 * @see #orderColumn
	 **/
	public static final String ORDER_COLUMN = "orderColumn";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Topic}
	 **/
	public static volatile EntityType<Topic> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Topic#id}
	 **/
	public static volatile SingularAttribute<Topic, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Topic#itemsOnPage}
	 **/
	public static volatile SingularAttribute<Topic, Integer> itemsOnPage;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Topic#refreshInterval}
	 **/
	public static volatile SingularAttribute<Topic, Integer> refreshInterval;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Topic#selectedColumn}
	 **/
	public static volatile SingularAttribute<Topic, String> selectedColumn;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Topic#orderColumn}
	 **/
	public static volatile SingularAttribute<Topic, String> orderColumn;

}

