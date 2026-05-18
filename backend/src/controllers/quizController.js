const quizModel = require("../models/quizModel");
const questionModel = require("../models/questionModel");

const isManager = (user) => ["instructor", "admin"].includes(user.role);

const listQuizzes = async (req, res) => {
  try {
    let quizzes;

    if (req.user.role === "admin") {
      quizzes = await quizModel.findAll();
    } else if (req.user.role === "instructor") {
      const all = await quizModel.findAll();
      quizzes = all.filter(
        (quiz) => quiz.created_by === req.user.id || quiz.is_published
      );
    } else {
      quizzes = await quizModel.findAll({ publishedOnly: true });
    }

    res.json({ quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const manager = isManager(req.user);
    const canView =
      quiz.is_published ||
      (manager &&
        (req.user.role === "admin" || quiz.created_by === req.user.id));

    if (!canView) {
      return res.status(403).json({ message: "Quiz is not available" });
    }

    const includeCorrect = manager && quiz.created_by === req.user.id;
    const isAdminViewer = req.user.role === "admin";
    const questions = await questionModel.findByQuizId(
      req.quizId,
      includeCorrect || isAdminViewer
    );

    res.json({ quiz, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getQuizForTaking = async (req, res) => {
  try {
    const quiz = await quizModel.findById(req.quizId);

    if (!quiz || !quiz.is_published) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await questionModel.findByQuizId(req.quizId, false);

    if (!questions.length) {
      return res.status(400).json({ message: "Quiz has no questions yet" });
    }

    res.json({ quiz, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createQuiz = async (req, res) => {
  try {
    const quiz = await quizModel.create(req.user.id, {
      title: req.body.title.trim(),
      description: req.body.description?.trim(),
      subject: req.body.subject?.trim(),
      grade_level: req.body.grade_level?.trim(),
      time_limit_minutes: req.body.time_limit_minutes,
      is_published: req.body.is_published,
    });

    res.status(201).json({ message: "Quiz created", quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const quiz = await quizModel.update(
      req.quizId,
      req.user.id,
      {
        title: req.body.title?.trim(),
        description: req.body.description,
        subject: req.body.subject,
        grade_level: req.body.grade_level,
        time_limit_minutes: req.body.time_limit_minutes,
        is_published: req.body.is_published,
      },
      isAdmin
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ message: "Quiz updated", quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const deleted = await quizModel.remove(
      req.quizId,
      req.user.id,
      req.user.role === "admin"
    );

    if (!deleted) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({ message: "Quiz deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listQuizzes,
  getQuiz,
  getQuizForTaking,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
