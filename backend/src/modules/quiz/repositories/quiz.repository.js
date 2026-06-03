import { prisma } from '../../../shared/db/prisma.js';

export class QuizRepository {
  listPublished() {
    return prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  findPublishedById(quizId) {
    return prisma.quiz.findFirst({
      where: { id: Number(quizId), isPublished: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
          },
        },
        _count: { select: { questions: true } },
      },
    });
  }

  findQuestionsForQuiz(quizId) {
    return prisma.quizQuestion.findMany({
      where: { quizId: Number(quizId) },
      orderBy: { orderIndex: 'asc' },
      include: {
        options: { orderBy: { orderIndex: 'asc' } },
      },
    });
  }
}
