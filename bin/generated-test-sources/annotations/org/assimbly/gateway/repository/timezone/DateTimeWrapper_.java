package org.assimbly.gateway.repository.timezone;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.OffsetTime;
import java.time.ZonedDateTime;

/**
 * Static metamodel for {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper}
 **/
@StaticMetamodel(DateTimeWrapper.class)
@Generated("org.hibernate.processor.HibernateProcessor")
public abstract class DateTimeWrapper_ {

	
	/**
	 * @see #id
	 **/
	public static final String ID = "id";
	
	/**
	 * @see #instant
	 **/
	public static final String INSTANT = "instant";
	
	/**
	 * @see #localDateTime
	 **/
	public static final String LOCAL_DATE_TIME = "localDateTime";
	
	/**
	 * @see #offsetDateTime
	 **/
	public static final String OFFSET_DATE_TIME = "offsetDateTime";
	
	/**
	 * @see #zonedDateTime
	 **/
	public static final String ZONED_DATE_TIME = "zonedDateTime";
	
	/**
	 * @see #localTime
	 **/
	public static final String LOCAL_TIME = "localTime";
	
	/**
	 * @see #offsetTime
	 **/
	public static final String OFFSET_TIME = "offsetTime";
	
	/**
	 * @see #localDate
	 **/
	public static final String LOCAL_DATE = "localDate";

	
	/**
	 * Static metamodel type for {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper}
	 **/
	public static volatile EntityType<DateTimeWrapper> class_;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#id}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, Long> id;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#instant}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, Instant> instant;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#localDateTime}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, LocalDateTime> localDateTime;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#offsetDateTime}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, OffsetDateTime> offsetDateTime;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#zonedDateTime}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, ZonedDateTime> zonedDateTime;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#localTime}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, LocalTime> localTime;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#offsetTime}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, OffsetTime> offsetTime;
	
	/**
	 * Static metamodel for attribute {@link org.assimbly.gateway.repository.timezone.DateTimeWrapper#localDate}
	 **/
	public static volatile SingularAttribute<DateTimeWrapper, LocalDate> localDate;

}

