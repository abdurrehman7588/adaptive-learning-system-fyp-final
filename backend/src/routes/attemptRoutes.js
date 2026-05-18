const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  parseAttemptId,
  parseChildIdParam,
  validateSubmitAttempt,
} = require("../middleware/validateQuiz");
const {
  submitAttempt,
  getAttempt,
  listChildAttempts,
} = require("../controllers/attemptController");

router.use(authenticate);

router.get(
  "/child/:childId",
  authorize("parent"),
  parseChildIdParam,
  listChildAttempts
);
router.get("/:attemptId", parseAttemptId, getAttempt);
router.post(
  "/:attemptId/submit",
  parseAttemptId,
  authorize("parent"),
  validateSubmitAttempt,
  submitAttempt
);

module.exports = router;
