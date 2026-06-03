import { prisma } from '../../../shared/db/prisma.js';

export class ChildRepository {
  insert(data) {
    return prisma.child.create({ data });
  }

  findById(id) {
    return prisma.child.findUnique({ where: { id: Number(id) } });
  }

  findByIdWithParent(id) {
    return prisma.child.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  findByIdAndParentId(childId, parentId) {
    return prisma.child.findFirst({
      where: { id: Number(childId), parentId: Number(parentId) },
    });
  }

  findByUsername(username) {
    return prisma.child.findUnique({
      where: { username: username.toLowerCase() },
    });
  }

  listByParentId(parentId) {
    return prisma.child.findMany({
      where: { parentId: Number(parentId) },
      orderBy: { createdAt: 'asc' },
    });
  }

  countByParentId(parentId) {
    return prisma.child.count({
      where: { parentId: Number(parentId) },
    });
  }

  update(childId, data) {
    return prisma.child.update({
      where: { id: Number(childId) },
      data,
    });
  }

  deleteById(childId) {
    return prisma.child.delete({
      where: { id: Number(childId) },
    });
  }

  isUsernameTaken(username, excludeChildId) {
    return prisma.child.findFirst({
      where: {
        username: username.toLowerCase(),
        ...(excludeChildId ? { NOT: { id: Number(excludeChildId) } } : {}),
      },
      select: { id: true },
    });
  }
}
