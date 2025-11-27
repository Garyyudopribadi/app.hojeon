export type Role = 'developer' | 'management' | 'staff' | string

// Currently all roles have full access (create/edit/delete).
// This helper centralizes permission checks for future changes.
export function canCreate(role?: string | null) {
  return true
}

export function canEdit(role?: string | null) {
  return true
}

export function canDelete(role?: string | null) {
  return true
}

export const ROLES: Role[] = ['developer', 'management', 'staff']

export default {
  canCreate,
  canEdit,
  canDelete,
  ROLES,
}
