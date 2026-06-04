import { prisma } from '../../../shared/db/prisma.js';

export class EmotionalRepository {
  /**
   * @param {number} childId
   * @param {{
   *   selfAwarenessPercent: number,
   *   empathyPercent: number,
   *   selfRegulationPercent: number,
   *   overallPercent: number,
   *   selfAwarenessStatus: string,
   *   empathyStatus: string,
   *   selfRegulationStatus: string,
   *   responses: Array<{ dimension: string, questionIndex: number, value: number }>,
   * }} data
   */
  async createAssessment(childId, data) {
    return prisma.emotionalAssessment.create({
      data: {
        childId,
        selfAwarenessPercent: data.selfAwarenessPercent,
        empathyPercent: data.empathyPercent,
        selfRegulationPercent: data.selfRegulationPercent,
        overallPercent: data.overallPercent,
        selfAwarenessStatus: data.selfAwarenessStatus,
        empathyStatus: data.empathyStatus,
        selfRegulationStatus: data.selfRegulationStatus,
        responses: {
          create: data.responses.map((row) => ({
            dimension: row.dimension,
            questionIndex: row.questionIndex,
            value: row.value,
          })),
        },
      },
      include: { responses: true },
    });
  }

  findLatestAssessment(childId) {
    return prisma.emotionalAssessment.findFirst({
      where: { childId },
      orderBy: { completedAt: 'desc' },
    });
  }

  findAssessmentHistory(childId, limit = 20) {
    return prisma.emotionalAssessment.findMany({
      where: { childId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * @param {number} childId
   * @param {{
   *   activitySlug: string,
   *   dimension: string,
   *   xpAwarded: number,
   *   payload: object,
   * }} data
   */
  createActivityCompletion(childId, data) {
    return prisma.emotionalActivityCompletion.create({
      data: {
        childId,
        activitySlug: data.activitySlug,
        dimension: data.dimension,
        xpAwarded: data.xpAwarded,
        payload: data.payload,
      },
    });
  }

  sumXpAwarded(childId) {
    return prisma.emotionalActivityCompletion.aggregate({
      where: { childId },
      _sum: { xpAwarded: true },
    });
  }

  findFeelingsJournalCompletions(childId, limit = 30) {
    return prisma.emotionalActivityCompletion.findMany({
      where: { childId, activitySlug: 'feelings_today' },
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: { payload: true, completedAt: true },
    });
  }
}
