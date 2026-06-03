export function mapParentUserDto(user, childIds = []) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'parent',
    childIds: childIds.map(String),
  };
}

export function mapStudentUserDto(identity) {
  return {
    id: identity.childId,
    name: identity.name,
    role: 'student',
    age: identity.age ?? 8,
    grade: identity.gradeLevel ?? '1st Grade',
    parentId: identity.parentId ? String(identity.parentId) : undefined,
    avatar: identity.avatarUrl ?? undefined,
  };
}

export function mapAdminUserDto(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'admin',
    childIds: [],
  };
}
