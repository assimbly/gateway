import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay } from 'rxjs';

import { serverApiUrl } from 'app/config';

import { Components } from './component-type';
import { OptionSchema, PathRule, pathRule } from './endpoint';

interface ComponentSchema {
  component?: { syntax?: string };
  properties?: Record<string, Omit<OptionSchema, 'name'>>;
}

/**
 * The path rules of the Components in use, read once per session from the component schema the backend serves.
 * A Component whose schema hasn't arrived (or can't be read) has no rule, so its paths aren't checked.
 */
@Injectable({ providedIn: 'root' })
export class ComponentSchemas {
  /** Goes up each time rules arrive, so whoever depends on `pathRule` can check again. */
  readonly version = signal(0);

  private readonly http = inject(HttpClient);
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
      const camelType = this.components.getCamelComponentType(componentType);
      load = this.http.get<ComponentSchema>(`${serverApiUrl}api/integration/flow/schema/${camelType}`).pipe(
        map(schema => {
          const syntax = schema.component?.syntax;
          const properties = Object.entries(schema.properties ?? {}).map(([name, property]) => ({ name, ...property }));
          this.rules.set(componentType, syntax ? pathRule(syntax, properties) : null);
          this.version.update(version => version + 1);
        }),
        catchError(() => {
          this.rules.set(componentType, null);
          return of(undefined);
        }),
        shareReplay(1),
      );
      this.loading.set(componentType, load);
    }
    return load;
  }
}
