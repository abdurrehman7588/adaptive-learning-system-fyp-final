const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const {
  validateLogin,
  validateRegister,
} = require("../middleware/validateAuth");

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
