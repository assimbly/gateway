import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay } from 'rxjs';

import { Components } from 'app/shared/camel/component-type';
import { OptionSchema, PathRule, pathRule } from 'app/shared/camel/endpoint';

import { FlowService } from './flow.service';

interface ComponentSchema {
  component?: { syntax?: string };
  properties?: Record<string, Omit<OptionSchema, 'name'>>;
}

/**
 * The path rules of the Components in use, read once per session from the component schema the backend serves.
 * A Component whose schema hasn't arrived has no rule, so its paths aren't checked; a failed read is tried again
 * the next time it is asked for.
 */
@Injectable({ providedIn: 'root' })
export class ComponentSchemas {
  private readonly flowService = inject(FlowService);
  private readonly components = inject(Components);
  private readonly rules = new Map<string, PathRule | null>();
  private readonly loading = new Map<string, Observable<void>>();

  readonly pathRule = (componentType: string): PathRule | undefined => this.rules.get(componentType.toLowerCase()) ?? undefined;

  /** Reads the schemas of these Components that haven't been read yet. */
  load(componentTypes: (string | undefined)[]): Observable<void> {
    const wanted = [...new Set(componentTypes.filter((type): type is string => !!type).map(type => type.toLowerCase()))];
    const loads = wanted.filter(type => !this.rules.has(type)).map(type => this.loadOne(type));
    return loads.length ? forkJoin(loads).pipe(map(() => undefined)) : of(undefined);
  }

  private loadOne(componentType: string): Observable<void> {
    let load = this.loading.get(componentType);
    if (!load) {
      load = this.flowService.getComponentOptions(this.components.getCamelComponentType(componentType)).pipe(
        map(response => {
          const schema: ComponentSchema = response.body ?? {};
          const syntax = schema.component?.syntax;
          const properties = Object.entries(schema.properties ?? {}).map(([name, property]) => ({ name, ...property }));
          this.rules.set(componentType, syntax ? pathRule(syntax, properties) : null);
        }),
        catchError(() => {
          this.loading.delete(componentType);
          return of(undefined);
        }),
        shareReplay(1),
      );
      this.loading.set(componentType, load);
    }
    return load;
  }
}
