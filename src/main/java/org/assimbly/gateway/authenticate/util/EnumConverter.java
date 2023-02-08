package org.assimbly.gateway.authenticate.util;

import org.mongodb.morphia.converters.SimpleValueConverter;
import org.mongodb.morphia.converters.TypeConverter;
import org.mongodb.morphia.mapping.MappedField;
import org.mongodb.morphia.mapping.MappingException;
import org.assimbly.gateway.authenticate.domain.Role;
import org.assimbly.gateway.authenticate.domain.Status;

/**
 * Used to converting the Role enum saved in lower case format in MongoDB by Rails
 * to an enum that can be used by this system.
 */
public class EnumConverter extends TypeConverter implements SimpleValueConverter {

    public EnumConverter() {
        super(Role.class, Status.class);
    }

    @Override
    protected boolean isSupported(Class<?> c, MappedField info) {
        return c.equals(Role.class) || c.equals(Status.class);
    }

    @Override
    public Object decode(Class<?> targetClass, Object obj, MappedField info) throws MappingException {
        if (obj == null) {
            return null;
        }

        String value = (String) obj;
        value = value.toUpperCase();

        return Role.class.equals(targetClass) ?
                Role.valueOf(value) :
                Status.valueOf(value);
    }

    @Override
    public Object encode(Object obj, MappedField optionalExtraInfo) {
        if (obj == null) {
            return null;
        }

        return obj.toString();
    }
}
