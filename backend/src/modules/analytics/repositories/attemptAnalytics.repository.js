import { prisma } from '../../../shared/db/prisma.js';

export class AttemptAnalyticsRepository {
  /**
   * @param {number} childId
   */
  findAttemptsForChild(childId) {
    return prisma.quizAttempt.findMany({
      where: { childId: Number(childId) },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
          include: {
            _count: { select: { questions: true } },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  /**
   * @param {number} parentId
   */
  findAttemptsForParentChildren(parentId) {
    return prisma.quizAttempt.findMany({
      where: {
        child: { parentId: Number(parentId) },
      },
      orderBy: { startedAt: 'desc' },
      include: {
        quiz: {
          include: {
            _count: { select: { questions: true } },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
        child: {
          select: { id: true, name: true, gradeLevel: true },
        },
      },
    });
  }

  listPublishedQuizzes() {
    return prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }
}
