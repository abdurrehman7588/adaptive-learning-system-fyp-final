const quizModel = require("../models/quizModel");
const questionModel = require("../models/questionModel");

const ensureCanManageQuiz = async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const allowed = await quizModel.canManage(req.quizId, req.user.id, isAdmin);

  if (!allowed) {
    res.status(404).json({ message: "Quiz not found" });
    return false;
  }

  return true;
};

const listQuestions = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const isManager = ["instructor", "admin"].includes(req.user.role);
    const canView =
      quiz.is_published ||
      (isManager &&
        (req.user.role === "admin" || quiz.created_by === req.user.id));

    if (!canView) {
      return res.status(403).json({ message: "Quiz is not available" });
    }

    const includeCorrect =
      isManager && (req.user.role === "admin" || quiz.created_by === req.user.id);
    const questions = await questionModel.findByQuizId(
      req.quizId,
      includeCorrect
    );

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createQuestion = async (req, res) => {
  try {
    if (!(await ensureCanManageQuiz(req, res))) {
      return;
    }

    const { question_text, question_type, points, order_index, options } =
      req.body;

    const question = await questionModel.createWithOptions(req.quizId, {
      question_text: question_text.trim(),
      question_type: question_type || "multiple_choice",
      points: points ?? 1,
      order_index: order_index ?? 0,
      options,
    });

    res.status(201).json({ message: "Question created", question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateQuestion = async (req, res) => {
  try {
    if (!(await ensureCanManageQuiz(req, res))) {
      return;
    }

    const { question_text, question_type, points, order_index, options } =
      req.body;

    const question = await questionModel.updateWithOptions(
      req.questionId,
      req.quizId,
      {
        question_text: question_text?.trim(),
        question_type,
        points,
        order_index,
        options,
      }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question updated", question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    if (!(await ensureCanManageQuiz(req, res))) {
      return;
    }

    const deleted = await questionModel.remove(req.questionId, req.quizId);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({ message: "Question deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
