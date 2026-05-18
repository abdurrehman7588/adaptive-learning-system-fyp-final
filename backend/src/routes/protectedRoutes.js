const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/profile", (req, res) => {
  res.json({ user: req.user });
});

router.get("/admin", authorize("admin"), (req, res) => {
  res.json({ message: "Admin-only route", user: req.user });
});

module.exports = router;
