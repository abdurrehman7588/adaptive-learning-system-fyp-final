/**
 * Idempotent demo quiz attempts for analytics / recommendations verification.
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedQuizAttempts(prisma) {
  const username = (process.env.DEMO_CHILD_USERNAME ?? 'demokid').trim().toLowerCase();
  const child = await prisma.child.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!child) {
    return;
  }

  const existingCompleted = await prisma.quizAttempt.count({
    where: { childId: child.id, status: 'completed' },
  });

  if (existingCompleted > 0) {
    console.log(`Quiz attempts already present for ${username} (${existingCompleted} completed)`);
    return;
  }

  const quizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      },
    },
    take: 3,
  });

  if (quizzes.length === 0) {
    return;
  }

  const scenarios = [
    { quizIndex: 0, correctRatio: 0.33, daysAgo: 3 },
    { quizIndex: 1, correctRatio: 0.9, daysAgo: 1 },
    { quizIndex: 2, correctRatio: 0.85, daysAgo: 0 },
  ];

  for (const scenario of scenarios) {
    const quiz = quizzes[scenario.quizIndex];
    if (!quiz) continue;

    const questions = quiz.questions;
    const totalPoints = questions.length;
    let score = 0;
    const answerRows = [];

    const targetCorrect = Math.max(
      0,
      Math.min(totalPoints, Math.round(totalPoints * scenario.correctRatio)),
    );

    for (let qIndex = 0; qIndex < questions.length; qIndex += 1) {
      const question = questions[qIndex];
      const options = question.options;
      const correct = options.find((opt) => opt.isCorrect) ?? options[0];
      const incorrect = options.find((opt) => !opt.isCorrect) ?? correct;
      const pickCorrect = qIndex < targetCorrect;
      const selected = pickCorrect ? correct : incorrect;

      if (pickCorrect) score += 1;

      answerRows.push({
        questionId: question.id,
        selectedOptionId: selected.id,
        isCorrect: pickCorrect,
        timeTakenSeconds: 20 + Math.floor(Math.random() * 25),
      });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const completedAt = new Date();
    completedAt.setDate(completedAt.getDate() - scenario.daysAgo);

    await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        childId: child.id,
        status: 'completed',
        score,
        totalPoints,
        percentage,
        passed: percentage >= 60,
        startedAt: completedAt,
        completedAt,
        answers: { create: answerRows },
      },
    });
  }

  console.log(`Seeded ${scenarios.length} completed quiz attempts for ${username}`);
}
