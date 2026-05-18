const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseQuizId = (req, res, next) => {
  const quizId = parsePositiveInt(req.params.quizId);
  if (!quizId) {
    return res.status(400).json({ message: "Invalid quiz id" });
  }
  req.quizId = quizId;
  next();
};

const parseQuestionId = (req, res, next) => {
  const questionId = parsePositiveInt(req.params.questionId);
  if (!questionId) {
    return res.status(400).json({ message: "Invalid question id" });
  }
  req.questionId = questionId;
  next();
};

const parseAttemptId = (req, res, next) => {
  const attemptId = parsePositiveInt(req.params.attemptId);
  if (!attemptId) {
    return res.status(400).json({ message: "Invalid attempt id" });
  }
  req.attemptId = attemptId;
  next();
};

const parseChildIdParam = (req, res, next) => {
  const childId = parsePositiveInt(req.params.childId);
  if (!childId) {
    return res.status(400).json({ message: "Invalid child id" });
  }
  req.childId = childId;
  next();
};

const validateOptions = (options, questionType) => {
  if (!Array.isArray(options) || options.length < 2) {
    return "At least two answer options are required";
  }

  const correctCount = options.filter((o) => o.is_correct).length;

  if (questionType === "true_false" && options.length !== 2) {
    return "True/false questions must have exactly two options";
  }

  if (correctCount !== 1) {
    return "Exactly one correct option is required";
  }

  for (const option of options) {
    if (!isNonEmptyString(option.option_text)) {
      return "Each option must have text";
    }
  }

  return null;
};

const validateCreateQuiz = (req, res, next) => {
  if (!isNonEmptyString(req.body.title)) {
    return res.status(400).json({ message: "Quiz title is required" });
  }
  next();
};

const validateUpdateQuiz = (req, res, next) => {
  if (req.body.title !== undefined && !isNonEmptyString(req.body.title)) {
    return res.status(400).json({ message: "Quiz title cannot be empty" });
  }
  next();
};

const validateCreateQuestion = (req, res, next) => {
  const { question_text, question_type = "multiple_choice", points, options } =
    req.body;

  if (!isNonEmptyString(question_text)) {
    return res.status(400).json({ message: "Question text is required" });
  }

  if (!["multiple_choice", "true_false"].includes(question_type)) {
    return res.status(400).json({ message: "Invalid question type" });
  }

  if (points !== undefined && (!Number.isInteger(points) || points < 1)) {
    return res.status(400).json({ message: "Points must be a positive integer" });
  }

  const optionsError = validateOptions(options, question_type);
  if (optionsError) {
    return res.status(400).json({ message: optionsError });
  }

  next();
};

const validateUpdateQuestion = (req, res, next) => {
  const { question_text, question_type, points, options } = req.body;

  if (question_text !== undefined && !isNonEmptyString(question_text)) {
    return res.status(400).json({ message: "Question text cannot be empty" });
  }

  if (
    question_type !== undefined &&
    !["multiple_choice", "true_false"].includes(question_type)
  ) {
    return res.status(400).json({ message: "Invalid question type" });
  }

  if (points !== undefined && (!Number.isInteger(points) || points < 1)) {
    return res.status(400).json({ message: "Points must be a positive integer" });
  }

  if (options !== undefined) {
    const optionsError = validateOptions(
      options,
      question_type || "multiple_choice"
    );
    if (optionsError) {
      return res.status(400).json({ message: optionsError });
    }
  }

  next();
};

const validateStartAttempt = (req, res, next) => {
  const childId = parsePositiveInt(req.body.child_id);
  if (!childId) {
    return res.status(400).json({ message: "Valid child_id is required" });
  }
  req.body.child_id = childId;
  next();
};

const validateSubmitAttempt = (req, res, next) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "Answers array is required" });
  }

  for (const answer of answers) {
    if (!parsePositiveInt(answer.question_id)) {
      return res.status(400).json({ message: "Each answer needs a valid question_id" });
    }
    if (!parsePositiveInt(answer.selected_option_id)) {
      return res
        .status(400)
        .json({ message: "Each answer needs a valid selected_option_id" });
    }
  }

  next();
};

module.exports = {
  parseQuizId,
  parseQuestionId,
  parseAttemptId,
  parseChildIdParam,
  validateCreateQuiz,
  validateUpdateQuiz,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateStartAttempt,
  validateSubmitAttempt,
};
