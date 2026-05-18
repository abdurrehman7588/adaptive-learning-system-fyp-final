const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  validateCreateChild,
  validateUpdateChild,
  parseChildId,
} = require("../middleware/validateChild");
const {
  listChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
} = require("../controllers/childController");
const {
  getChildAnalytics,
  getParentOverview,
} = require("../controllers/analyticsController");

router.use(authenticate, authorize("parent"));

router.get("/", listChildren);
router.get("/analytics/overview", getParentOverview);
router.post("/", validateCreateChild, createChild);
router.get("/:id/analytics", parseChildId, getChildAnalytics);
router.get("/:id", parseChildId, getChild);
router.put("/:id", parseChildId, validateUpdateChild, updateChild);
router.delete("/:id", parseChildId, deleteChild);

module.exports = router;
