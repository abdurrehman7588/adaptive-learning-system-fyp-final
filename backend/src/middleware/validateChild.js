const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidDateString = (value) => {
  if (value === null || value === undefined || value === "") {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const validateCreateChild = (req, res, next) => {
  const { name, date_of_birth, grade_level, avatar_url, learning_preferences } =
    req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: "Child name is required" });
  }

  if (!isValidDateString(date_of_birth)) {
    return res.status(400).json({ message: "Invalid date of birth" });
  }

  if (grade_level !== undefined && grade_level !== null && grade_level !== "") {
    if (!isNonEmptyString(grade_level)) {
      return res.status(400).json({ message: "Invalid grade level" });
    }
  }

  if (
    learning_preferences !== undefined &&
    !isPlainObject(learning_preferences)
  ) {
    return res.status(400).json({
      message: "Learning preferences must be a JSON object",
    });
  }

  next();
};

const validateUpdateChild = (req, res, next) => {
  const { name, date_of_birth, grade_level, learning_preferences } = req.body;

  if (name !== undefined && !isNonEmptyString(name)) {
    return res.status(400).json({ message: "Child name cannot be empty" });
  }

  if (!isValidDateString(date_of_birth)) {
    return res.status(400).json({ message: "Invalid date of birth" });
  }

  if (grade_level !== undefined && grade_level !== null && grade_level !== "") {
    if (!isNonEmptyString(grade_level)) {
      return res.status(400).json({ message: "Invalid grade level" });
    }
  }

  if (
    learning_preferences !== undefined &&
    !isPlainObject(learning_preferences)
  ) {
    return res.status(400).json({
      message: "Learning preferences must be a JSON object",
    });
  }

  next();
};

const parseChildId = (req, res, next) => {
  const childId = Number.parseInt(req.params.id, 10);

  if (!Number.isInteger(childId) || childId <= 0) {
    return res.status(400).json({ message: "Invalid child id" });
  }

  req.childId = childId;
  next();
};

module.exports = {
  validateCreateChild,
  validateUpdateChild,
  parseChildId,
};
