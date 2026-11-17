package org.assimbly.gateway.web.rest.util;

import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

import static org.assertj.core.api.Assertions.assertThat;

class FlowLogFilterTest {

    /** Lines as the gateway writes them to spring.log, for Flow 1851 and the others around it. */
    private static final String LOG = """
        2026-10-18T21:43:45.222+02:00 DEBUG 19468 --- [gateway] [tomcat-handler-55] o.a.g.web.rest.integration.LinkResource  : Enter: createLink() with argument[s] = [LinkDTO{id=null, name='1851-1902'}]
        2026-10-18T21:43:50.330+02:00  INFO 19468 --- [gateway] [tomcat-handler-75] o.assimbly.dil.loader.FlowLoaderReport   : Initialize flow report | flowid=1851
        2026-10-18T21:43:51.052+02:00  INFO 19468 --- [gateway] [tomcat-handler-75] o.a.i.impl.manager.FlowManager           : Started flow successfully | flowid=1851
        2026-10-18T21:43:52.098+02:00  INFO 19468 --- [gateway] [hello] org.assimbly.runtime.1851                : Exchange[
          BodyType: String
          Body: Hello world
        ]
        2026-10-18T21:43:52.120+02:00  INFO 19468 --- [gateway] [hello] org.assimbly.runtime.18510               : Exchange[
          Body: Another flow
        ]
        2026-10-18T21:43:53.000+02:00 ERROR 19468 --- [gateway] [Camel (assimbly) thread #5 - scheduler://scheduler2] Hello world/1851                         : Exchange[Id: C5E04CB300CBDF2-0000000000000022, RouteGroup: 1851]
        2026-10-18T21:43:53.001+02:00 ERROR 19468 --- [gateway] [Camel (assimbly) thread #5 - scheduler://scheduler2] org.assimbly.errorhandler.1851           : Failed delivery for (MessageId: C5E04CB300CBDF2-0000000000000022)
        org.apache.camel.ValidationException: Allowed body types are String
        \tat org.apache.camel.Some.method(Some.java:1)
        2026-10-18T21:43:54.000+02:00 ERROR 19468 --- [gateway] [Camel (assimbly) thread #6 - scheduler://scheduler3] MyScript2/1402                           : Exchange[Id: 1, RouteGroup: 1402]
        2026-10-18T21:43:55.000+02:00 DEBUG 19468 --- [gateway] [tomcat-handler-80] o.a.g.web.rest.integration.LinkResource  : Exit: createLink() with result = [Location:"/api/link/1851 : x"]
        2026-10-18T21:43:56.000+02:00  INFO 19468 --- [gateway] [tomcat-handler-89] o.a.i.impl.manager.FlowManager           : Stopped flow successfully | flowid=18510
        2026-10-18T21:44:20.400+02:00  INFO 19468 --- [gateway] [tomcat-handler-89] o.a.i.impl.manager.FlowManager           : Stopped flow successfully | flowid=1851
        """;

    private static String tail(long flowId, int entries) throws IOException {
        return new FlowLogFilter(flowId).tail(new BufferedReader(new StringReader(LOG)), entries);
    }

    @Test
    void keepsOnlyTheEntriesOfTheFlowWithTheLinesThatBelongToThem() throws IOException {
        assertThat(tail(1851, 250).lines()).containsExactly(
            "2026-10-18T21:43:50.330+02:00  INFO 19468 --- [gateway] [tomcat-handler-75] o.assimbly.dil.loader.FlowLoaderReport   : Initialize flow report | flowid=1851",
            "2026-10-18T21:43:51.052+02:00  INFO 19468 --- [gateway] [tomcat-handler-75] o.a.i.impl.manager.FlowManager           : Started flow successfully | flowid=1851",
            "2026-10-18T21:43:52.098+02:00  INFO 19468 --- [gateway] [hello] org.assimbly.runtime.1851                : Exchange[",
            "  BodyType: String",
            "  Body: Hello world",
            "]",
            "2026-10-18T21:43:53.000+02:00 ERROR 19468 --- [gateway] [Camel (assimbly) thread #5 - scheduler://scheduler2] Hello world/1851                         : Exchange[Id: C5E04CB300CBDF2-0000000000000022, RouteGroup: 1851]",
            "2026-10-18T21:43:53.001+02:00 ERROR 19468 --- [gateway] [Camel (assimbly) thread #5 - scheduler://scheduler2] org.assimbly.errorhandler.1851           : Failed delivery for (MessageId: C5E04CB300CBDF2-0000000000000022)",
            "org.apache.camel.ValidationException: Allowed body types are String",
            "\tat org.apache.camel.Some.method(Some.java:1)",
            "2026-10-18T21:44:20.400+02:00  INFO 19468 --- [gateway] [tomcat-handler-89] o.a.i.impl.manager.FlowManager           : Stopped flow successfully | flowid=1851"
        );
    }

    @Test
    void aFlowWhoseIdStartsTheSameIsNotMixedIn() throws IOException {
        assertThat(tail(18510, 250))
            .contains("Body: Another flow", "flowid=18510")
            .doesNotContain("Hello world", "flowid=1851\n");
        assertThat(tail(185, 250)).isEmpty();
    }

    @Test
    void keepsTheLastEntries() throws IOException {
        assertThat(tail(1851, 2).lines()).containsExactly(
            "2026-10-18T21:43:53.001+02:00 ERROR 19468 --- [gateway] [Camel (assimbly) thread #5 - scheduler://scheduler2] org.assimbly.errorhandler.1851           : Failed delivery for (MessageId: C5E04CB300CBDF2-0000000000000022)",
            "org.apache.camel.ValidationException: Allowed body types are String",
            "\tat org.apache.camel.Some.method(Some.java:1)",
            "2026-10-18T21:44:20.400+02:00  INFO 19468 --- [gateway] [tomcat-handler-89] o.a.i.impl.manager.FlowManager           : Stopped flow successfully | flowid=1851"
        );
    }

    @Test
    void anIdInTheMessageOfAnotherLoggerIsNotTheFlowsLogger() {
        FlowLogFilter filter = new FlowLogFilter(1851);
        assertThat(filter.matches("2026-10-18T21:43:55.000+02:00 DEBUG 1 --- [gateway] [t] o.a.g.web.rest.integration.LinkResource  : Exit: [Location:\"/api/link/1851 : x\"]")).isFalse();
        assertThat(filter.matches("2026-10-18T21:43:45.222+02:00 DEBUG 1 --- [gateway] [t] o.a.g.web.rest.integration.LinkResource  : name='1851-1902'")).isFalse();
    }
}
