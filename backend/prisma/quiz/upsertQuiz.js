/**
 * Slug-based quiz upsert — syncs questions by orderIndex without wiping unrelated attempts.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {import('./catalogTypes.js').QuizCatalogEntry} spec
 */
export async function upsertCatalogQuiz(prisma, spec) {
  const existing = await prisma.quiz.findUnique({
    where: { slug: spec.slug },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  });

  const quizData = {
    slug: spec.slug,
    title: spec.title,
    description: spec.description,
    category: spec.category,
    gradeLevel: spec.gradeLevel,
    difficultyLevel: spec.difficultyLevel,
    timeLimitMinutes: spec.timeLimitMinutes ?? null,
    passPercentage: spec.passPercentage ?? 60,
    isPublished: spec.isPublished ?? true,
    subject: spec.subject ?? null,
  };

  const quiz = existing
    ? await prisma.quiz.update({
        where: { id: existing.id },
        data: quizData,
      })
    : await prisma.quiz.create({ data: quizData });

  const existingByOrder = new Map(
    (existing?.questions ?? []).map((question) => [question.orderIndex, question]),
  );
  const specOrderIndexes = new Set(spec.questions.map((_, index) => index));

  for (let qIndex = 0; qIndex < spec.questions.length; qIndex += 1) {
    const qSpec = spec.questions[qIndex];
    const prior = existingByOrder.get(qIndex);

    const questionData = {
      questionText: qSpec.text,
      orderIndex: qIndex,
      topic: qSpec.topic ?? null,
      difficultyLevel: qSpec.difficultyLevel ?? null,
      skillArea: qSpec.skillArea ?? null,
      estimatedTimeSeconds: qSpec.estimatedTimeSeconds ?? 45,
    };

    const question = prior
      ? await prisma.quizQuestion.update({
          where: { id: prior.id },
          data: questionData,
        })
      : await prisma.quizQuestion.create({
          data: { quizId: quiz.id, ...questionData },
        });

    await prisma.quizQuestionOption.deleteMany({ where: { questionId: question.id } });

    for (let oIndex = 0; oIndex < qSpec.options.length; oIndex += 1) {
      await prisma.quizQuestionOption.create({
        data: {
          questionId: question.id,
          optionText: qSpec.options[oIndex],
          orderIndex: oIndex,
          isCorrect: oIndex === qSpec.correctIndex,
        },
      });
    }
  }

  const staleQuestions = (existing?.questions ?? []).filter(
    (question) => !specOrderIndexes.has(question.orderIndex),
  );

  if (staleQuestions.length > 0) {
    await prisma.quizQuestion.deleteMany({
      where: { id: { in: staleQuestions.map((row) => row.id) } },
    });
  }

  return quiz;
}
