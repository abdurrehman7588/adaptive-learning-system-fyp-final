import { prisma } from '../../../shared/db/prisma.js';

const defaultPreferences = () => ({
  emailNotifications: true,
  weeklyReportEmail: false,
  learningGoals: [],
  childInterests: [],
  preferredLanguage: null,
});

export class ParentProfileRepository {
  findByParentId(parentId) {
    return prisma.parentProfile.findUnique({
      where: { parentId: Number(parentId) },
    });
  }

  async insertDefault(parentId) {
    return prisma.parentProfile.create({
      data: {
        parentId: Number(parentId),
        preferences: defaultPreferences(),
      },
    });
  }

  async update(parentId, data) {
    return prisma.parentProfile.update({
      where: { parentId: Number(parentId) },
      data,
    });
  }

  async updatePreferences(parentId, preferences) {
    const row = await this.findByParentId(parentId);
    const current =
      row?.preferences && typeof row.preferences === 'object' ? row.preferences : {};
    const merged = { ...defaultPreferences(), ...current, ...preferences };

    return prisma.parentProfile.update({
      where: { parentId: Number(parentId) },
      data: { preferences: merged },
    });
  }
}
