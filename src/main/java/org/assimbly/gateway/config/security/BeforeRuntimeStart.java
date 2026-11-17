package org.assimbly.gateway.config.security;

/**
 * Work that must be done before the runtime starts, such as making sure stored secrets use this Gateway's key.
 * The runtime asks for every bean of this type first, so they are set up before it.
 */
public interface BeforeRuntimeStart {
}
