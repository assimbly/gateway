import { describe, expect, it } from 'vitest';

import { roleLabel } from './role-label.pipe';

describe('roleLabel', () => {
  it('names the two built-in roles Admin and User', () => {
    expect(roleLabel('ROLE_ADMIN')).toBe('Admin');
    expect(roleLabel('ROLE_USER')).toBe('User');
  });

  it('turns any other role into plain words', () => {
    expect(roleLabel('ROLE_DATA_STEWARD')).toBe('Data steward');
    expect(roleLabel('VIEWER')).toBe('Viewer');
  });

  it('is empty without a role', () => {
    expect(roleLabel(undefined)).toBe('');
    expect(roleLabel('')).toBe('');
  });
});
