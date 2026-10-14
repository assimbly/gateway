import { Pipe, PipeTransform } from '@angular/core';

const ROLE_PREFIX = 'ROLE_';

/** The name of a role as a person says it: `ROLE_ADMIN` is Admin, `ROLE_USER` is User, `ROLE_DATA_STEWARD` is Data steward. */
export function roleLabel(role: string | null | undefined): string {
  if (!role) {
    return '';
  }
  const words = (role.startsWith(ROLE_PREFIX) ? role.slice(ROLE_PREFIX.length) : role).replace(/_/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

@Pipe({ name: 'roleLabel' })
export default class RoleLabelPipe implements PipeTransform {
  transform(role: string | null | undefined): string {
    return roleLabel(role);
  }
}
