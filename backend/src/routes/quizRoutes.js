const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  parseQuizId,
  parseQuestionId,
  validateCreateQuiz,
  validateUpdateQuiz,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateStartAttempt,
} = require("../middleware/validateQuiz");
const {
  listQuizzes,
  getQuiz,
  getQuizForTaking,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { startAttempt } = require("../controllers/attemptController");

router.use(authenticate);

router.get("/", listQuizzes);
router.post(
  "/",
  authorize("instructor", "admin"),
  validateCreateQuiz,
  createQuiz
);

router.get("/:quizId/take", parseQuizId, authorize("parent"), getQuizForTaking);
router.post(
  "/:quizId/attempts",
  parseQuizId,
  authorize("parent"),
  validateStartAttempt,
  startAttempt
);

router.get("/:quizId/questions", parseQuizId, listQuestions);
router.post(
  "/:quizId/questions",
  parseQuizId,
  authorize("instructor", "admin"),
  validateCreateQuestion,
  createQuestion
);
router.put(
  "/:quizId/questions/:questionId",
  parseQuizId,
  parseQuestionId,
  authorize("instructor", "admin"),
  validateUpdateQuestion,
  updateQuestion
);
router.delete(
  "/:quizId/questions/:questionId",
  parseQuizId,
  parseQuestionId,
  authorize("instructor", "admin"),
  deleteQuestion
);

router.get("/:quizId", parseQuizId, getQuiz);
router.put(
  "/:quizId",
  parseQuizId,
  authorize("instructor", "admin"),
  validateUpdateQuiz,
  updateQuiz
);
router.delete(
  "/:quizId",
  parseQuizId,
  authorize("instructor", "admin"),
  deleteQuiz
);

module.exports = router;
