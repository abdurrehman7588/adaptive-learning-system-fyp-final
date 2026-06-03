import { prisma } from '../../../shared/db/prisma.js';

export class QuizAttemptRepository {
  createInProgress({ quizId, childId }) {
    return prisma.quizAttempt.create({
      data: {
        quizId: Number(quizId),
        childId: Number(childId),
        status: 'in_progress',
      },
    });
  }

  findById(attemptId) {
    return prisma.quizAttempt.findUnique({
      where: { id: Number(attemptId) },
      include: {
        quiz: true,
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });
  }

  completeAttempt(attemptId, payload) {
    return prisma.quizAttempt.update({
      where: { id: Number(attemptId) },
      data: {
        status: 'completed',
        score: payload.score,
        totalPoints: payload.totalPoints,
        percentage: payload.percentage,
        passed: payload.passed,
        completedAt: new Date(),
      },
    });
  }

  replaceAnswers(attemptId, answerRows) {
    return prisma.$transaction(async (tx) => {
      await tx.quizAttemptAnswer.deleteMany({
        where: { attemptId: Number(attemptId) },
      });

      if (answerRows.length > 0) {
        const answeredAt = new Date();
        await tx.quizAttemptAnswer.createMany({
          data: answerRows.map((row) => ({
            attemptId: Number(attemptId),
            questionId: row.questionId,
            selectedOptionId: row.selectedOptionId,
            isCorrect: row.isCorrect,
            timeTakenSeconds: row.timeTakenSeconds,
            answeredAt,
          })),
        });
      }

      return tx.quizAttempt.findUnique({
        where: { id: Number(attemptId) },
        include: {
          answers: true,
        },
      });
    });
  }
}
