import { prisma } from '../../../shared/db/prisma.js';

export class UserRepository {
  findById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  }

  findByEmail(email) {
    return prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  findByGoogleId(googleId) {
    return prisma.user.findUnique({ where: { googleId } });
  }

  async createParent({ name, email, passwordHash, googleId = null, avatarUrl = null }) {
    return prisma.user.create({
      data: {
        role: 'parent',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        googleId,
        avatarUrl,
      },
    });
  }

  async updateParentProfile(id, { name, avatarUrl }) {
    return prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    });
  }

  async upsertParentFromGoogle({ googleId, email, name, avatarUrl }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.findByGoogleId(googleId);

    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          name: name.trim(),
          email: normalizedEmail,
          avatarUrl: avatarUrl ?? existing.avatarUrl,
        },
      });
    }

    const byEmail = await this.findByEmail(normalizedEmail);
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId,
          name: name.trim(),
          avatarUrl: avatarUrl ?? byEmail.avatarUrl,
        },
      });
    }

    return this.createParent({
      name,
      email: normalizedEmail,
      passwordHash: null,
      googleId,
      avatarUrl,
    });
  }
}
