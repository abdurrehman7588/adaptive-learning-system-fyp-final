const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  next();
};

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!isNonEmptyString(email)) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!isNonEmptyString(password)) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!isNonEmptyString(role)) {
    return res.status(400).json({ message: "Role is required" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  next();
};

module.exports = { validateLogin, validateRegister };
