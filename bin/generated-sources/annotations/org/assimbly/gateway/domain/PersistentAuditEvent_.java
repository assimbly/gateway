package org.assimbly.gateway.domain;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.MapAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.Instant;

/**
 * Static metamodel for {@link org.assimbly.gateway.domain.PersistentAuditEvent}
 **/
@StaticMetamodel(PersistentAuditEvent.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class PersistentAuditEvent_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #principal
	 **/
	public static final String PRINCIPAL = "principal";
	
	/**
	 * @see #auditEventDate
	 **/
	public static final String AUDIT_EVENT_DATE = "auditEventDate";
	
	/**
	 * @see #auditEventType
	 **/
	public static final String AUDIT_EVENT_TYPE = "auditEventType";
	
	/**
	 * @see #data
	 **/
	public static final String DATA = "data";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.domain.PersistentAuditEvent}
	 **/
	public static volatile EntityType<PersistentAuditEvent> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentAuditEvent#id}
	 **/
	public static volatile SingularAttribute<PersistentAuditEvent, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentAuditEvent#principal}
	 **/
	public static volatile SingularAttribute<PersistentAuditEvent, String> principal;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentAuditEvent#auditEventDate}
	 **/
	public static volatile SingularAttribute<PersistentAuditEvent, Instant> auditEventDate;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentAuditEvent#auditEventType}
	 **/
	public static volatile SingularAttribute<PersistentAuditEvent, String> auditEventType;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.domain.PersistentAuditEvent#data}
	 **/
	public static volatile MapAttribute<PersistentAuditEvent, String, String> data;

}

