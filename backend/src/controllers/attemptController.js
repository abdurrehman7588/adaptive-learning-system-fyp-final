const childModel = require("../models/childModel");
const quizModel = require("../models/quizModel");
const questionModel = require("../models/questionModel");
const attemptModel = require("../models/attemptModel");

const verifyChildAccess = async (childId, user) => {
  if (user.role === "parent") {
    return childModel.findByIdAndParentId(childId, user.id);
  }
  return null;
};

const verifyAttemptAccess = async (attempt, user) => {
  if (user.role === "parent") {
    const child = await childModel.findByIdAndParentId(attempt.child_id, user.id);
    return Boolean(child);
  }

  if (["instructor", "admin"].includes(user.role)) {
    const quiz = await quizModel.findById(attempt.quiz_id);
    if (!quiz) {
      return false;
    }
    return user.role === "admin" || quiz.created_by === user.id;
  }

  return false;
};

const startAttempt = async (req, res) => {
  try {
    const childId = req.body.child_id;
    const child = await verifyChildAccess(childId, req.user);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const quiz = await quizModel.findById(req.quizId);

    if (!quiz || !quiz.is_published) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await questionModel.findByQuizId(req.quizId, false);

    if (!questions.length) {
      return res.status(400).json({ message: "Quiz has no questions yet" });
    }

    const existing = await attemptModel.findInProgress(req.quizId, childId);

    if (existing) {
      return res.json({
        message: "Resuming in-progress attempt",
        attempt: existing,
        questions,
      });
    }

    const totalPoints = await questionModel.getTotalPoints(req.quizId);
    const attempt = await attemptModel.create(req.quizId, childId, totalPoints);

    res.status(201).json({
      message: "Quiz attempt started",
      attempt,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const attempt = await attemptModel.findById(req.attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (!(await verifyAttemptAccess(attempt, req.user))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await attemptModel.submitAnswers(
      req.attemptId,
      req.body.answers
    );

    if (result.error === "not_found") {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (result.error === "already_completed") {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    if (result.error === "no_questions") {
      return res.status(400).json({ message: "Quiz has no questions" });
    }

    const details = await attemptModel.findByIdWithDetails(req.attemptId);

    res.json({
      message: "Quiz submitted successfully",
      attempt: details,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAttempt = async (req, res) => {
  try {
    const attempt = await attemptModel.findByIdWithDetails(req.attemptId);

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (!(await verifyAttemptAccess(attempt, req.user))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ attempt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const listChildAttempts = async (req, res) => {
  try {
    const child = await verifyChildAccess(req.childId, req.user);

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    const attempts = await attemptModel.findByChildId(req.childId);

    res.json({ attempts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getAttempt,
  listChildAttempts,
};
