const childModel = require("../models/childModel");

const listChildren = async (req, res) => {
  try {
    const children = await childModel.findByParentId(req.user.id);
    res.json({ children });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getChild = async (req, res) => {
  try {
    const child = await childModel.findByIdAndParentId(
      req.childId,
      req.user.id
    );

    if (!child) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    res.json({ child });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createChild = async (req, res) => {
  try {
    const { name, date_of_birth, grade_level, avatar_url, learning_preferences } =
      req.body;

    const child = await childModel.create(req.user.id, {
      name: name.trim(),
      date_of_birth: date_of_birth || null,
      grade_level: grade_level?.trim() || null,
      avatar_url: avatar_url?.trim() || null,
      learning_preferences: learning_preferences || {},
    });

    res.status(201).json({
      message: "Child profile created",
      child,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateChild = async (req, res) => {
  try {
    const existing = await childModel.findByIdAndParentId(
      req.childId,
      req.user.id
    );

    if (!existing) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    const { name, date_of_birth, grade_level, avatar_url, learning_preferences } =
      req.body;

    const child = await childModel.update(req.childId, req.user.id, {
      name: name !== undefined ? name.trim() : existing.name,
      date_of_birth:
        date_of_birth !== undefined
          ? date_of_birth || null
          : existing.date_of_birth,
      grade_level:
        grade_level !== undefined
          ? grade_level?.trim() || null
          : existing.grade_level,
      avatar_url:
        avatar_url !== undefined
          ? avatar_url?.trim() || null
          : existing.avatar_url,
      learning_preferences:
        learning_preferences !== undefined
          ? learning_preferences
          : existing.learning_preferences,
    });

    res.json({
      message: "Child profile updated",
      child,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteChild = async (req, res) => {
  try {
    const deleted = await childModel.remove(req.childId, req.user.id);

    if (!deleted) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    res.json({ message: "Child profile deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  listChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
};
