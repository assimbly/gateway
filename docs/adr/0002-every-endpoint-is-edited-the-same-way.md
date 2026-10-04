# Every Endpoint is edited the same way

Every Step's Endpoint is edited as `component:path?options`: one Component picker, one Path field with the Component's syntax as a hint, and Options as key–value rows. No Component gets its own form. We considered rich per-Component forms, as Boomi and n8n have (separate Host, Port and Directory fields for SFTP, for example), because they're friendlier to less technical users. We chose one generic editor because Assimbly offers every Component Apache Camel offers, and hand-made forms would need upkeep with every Camel release and would leave new Components looking second-class. Everything the editor shows comes from the Camel catalogue at runtime: titles, descriptions, categories, the path syntax, and each Option's type, default, group, required flag, secret flag and consumer or producer side.

## Consequences

- An Option's type only changes its value field: an on/off switch for a boolean, a dropdown for an enum, a number field for a number, a masked field for a secret. The key stays a key, and an Option the catalogue doesn't know can still be typed by hand.
- The step picker's categories are the catalogue's own labels, with no mapping table. Every Component stays available, and the list of Components and Options follows the Step's role (consumer for a Source, producer otherwise).
- An empty required path part makes the Flow a Draft. Required Options are pre-added and warned about but don't block, because Camel marks some Options as required that are often supplied another way, such as through a Connection.
- Adding per-Component forms later would mean maintaining them for every Camel upgrade. Improve the generic editor instead.
