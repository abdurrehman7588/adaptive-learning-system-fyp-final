/**
 * Slug-based quiz upsert — syncs questions by orderIndex without wiping unrelated attempts.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {import('./catalogTypes.js').QuizCatalogEntry} spec
 */
export async function upsertCatalogQuiz(prisma, spec) {
  const existing = await prisma.quiz.findUnique({
    where: { slug: spec.slug },
    select: {
      id: true,
      questions: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true, orderIndex: true },
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

  if (!existing) {
    return prisma.quiz.create({
      data: {
        ...quizData,
        questions: {
          create: spec.questions.map((qSpec, qIndex) => ({
            questionText: qSpec.text,
            orderIndex: qIndex,
            topic: qSpec.topic ?? null,
            difficultyLevel: qSpec.difficultyLevel ?? null,
            skillArea: qSpec.skillArea ?? null,
            estimatedTimeSeconds: qSpec.estimatedTimeSeconds ?? 45,
            options: {
              create: qSpec.options.map((optionText, oIndex) => ({
                optionText,
                orderIndex: oIndex,
                isCorrect: oIndex === qSpec.correctIndex,
              })),
            },
          })),
        },
      },
    });
  }

  const quiz = await prisma.quiz.update({
    where: { id: existing.id },
    data: quizData,
  });

  const existingByOrder = new Map(
    existing.questions.map((question) => [question.orderIndex, question]),
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
    await prisma.quizQuestionOption.createMany({
      data: qSpec.options.map((optionText, oIndex) => ({
        questionId: question.id,
        optionText,
        orderIndex: oIndex,
        isCorrect: oIndex === qSpec.correctIndex,
      })),
    });
  }

  const staleQuestions = existing.questions.filter(
    (question) => !specOrderIndexes.has(question.orderIndex),
  );

  if (staleQuestions.length > 0) {
    await prisma.quizQuestion.deleteMany({
      where: { id: { in: staleQuestions.map((row) => row.id) } },
    });
  }

  return quiz;
}
