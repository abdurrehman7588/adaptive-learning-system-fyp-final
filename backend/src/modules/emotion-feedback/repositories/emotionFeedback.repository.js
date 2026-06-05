import { prisma } from '../../../shared/db/prisma.js';

export class EmotionFeedbackRepository {
  /**
   * @param {{
   *   childId: number,
   *   quizAttemptId: number,
   *   emotionLabel: string,
   *   emotionScore: number,
   * }} data
   */
  create(data) {
    return prisma.quizEmotionFeedback.create({
      data: {
        childId: data.childId,
        quizAttemptId: data.quizAttemptId,
        emotionLabel: data.emotionLabel,
        emotionScore: data.emotionScore,
      },
      include: {
        quizAttempt: {
          select: {
            id: true,
            quizId: true,
            completedAt: true,
            quiz: { select: { title: true } },
          },
        },
      },
    });
  }

  findByAttemptId(quizAttemptId) {
    return prisma.quizEmotionFeedback.findUnique({
      where: { quizAttemptId },
    });
  }

  findLatestByChildId(childId) {
    return prisma.quizEmotionFeedback.findFirst({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      include: {
        quizAttempt: {
          select: {
            id: true,
            quizId: true,
            completedAt: true,
            quiz: { select: { title: true, slug: true } },
          },
        },
      },
    });
  }

  findByChildId(childId, limit = 30) {
    return prisma.quizEmotionFeedback.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        quizAttempt: {
          select: {
            id: true,
            quizId: true,
            completedAt: true,
            quiz: { select: { title: true, slug: true } },
          },
        },
      },
    });
  }
}
