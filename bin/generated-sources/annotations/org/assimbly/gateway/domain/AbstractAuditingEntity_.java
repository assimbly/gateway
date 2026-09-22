package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.MappedSuperclassType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.Instant;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.AbstractAuditingEntity}
 **/
@StaticMetamodel(AbstractAuditingEntity.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class AbstractAuditingEntity_ {

	
	/**
	 * @see #createdBy
	 **/
	public static final String CREATED_BY = "createdBy";
	
	/**
	 * @see #createdDate
	 **/
	public static final String CREATED_DATE = "createdDate";
	
	/**
	 * @see #lastModifiedBy
	 **/
	public static final String LAST_MODIFIED_BY = "lastModifiedBy";
	
	/**
	 * @see #lastModifiedDate
	 **/
	public static final String LAST_MODIFIED_DATE = "lastModifiedDate";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.AbstractAuditingEntity}
	 **/
	public static volatile MappedSuperclassType<AbstractAuditingEntity> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.AbstractAuditingEntity#createdBy}
	 **/
	public static volatile SingularAttribute<AbstractAuditingEntity, String> createdBy;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.AbstractAuditingEntity#createdDate}
	 **/
	public static volatile SingularAttribute<AbstractAuditingEntity, Instant> createdDate;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.AbstractAuditingEntity#lastModifiedBy}
	 **/
	public static volatile SingularAttribute<AbstractAuditingEntity, String> lastModifiedBy;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.AbstractAuditingEntity#lastModifiedDate}
	 **/
	public static volatile SingularAttribute<AbstractAuditingEntity, Instant> lastModifiedDate;

}

