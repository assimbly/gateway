package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.Queue}
 **/
@StaticMetamodel(Queue.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class Queue_ {

	
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
	 * Static metamodel type for {@link org.assimbly.gateway.domain.Queue}
	 **/
	public static volatile EntityType<Queue> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Queue#id}
	 **/
	public static volatile SingularAttribute<Queue, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Queue#itemsOnPage}
	 **/
	public static volatile SingularAttribute<Queue, Integer> itemsOnPage;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Queue#refreshInterval}
	 **/
	public static volatile SingularAttribute<Queue, Integer> refreshInterval;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Queue#selectedColumn}
	 **/
	public static volatile SingularAttribute<Queue, String> selectedColumn;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.Queue#orderColumn}
	 **/
	public static volatile SingularAttribute<Queue, String> orderColumn;

}

