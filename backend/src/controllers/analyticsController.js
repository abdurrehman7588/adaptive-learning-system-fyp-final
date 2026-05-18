const childModel = require("../models/childModel");
const analyticsModel = require("../models/analyticsModel");

const getChildAnalytics = async (req, res) => {
  try {
    const child = await childModel.findByIdAndParentId(
      req.childId,
      req.user.id
    );

    if (!child) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    const analytics = await analyticsModel.getChildAnalytics(req.childId);

    res.json({
      child: {
        id: child.id,
        name: child.name,
        gradeLevel: child.grade_level,
      },
      analytics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getParentOverview = async (req, res) => {
  try {
    const overview = await analyticsModel.getParentOverview(req.user.id);

    res.json({ overview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getChildAnalytics,
  getParentOverview,
};
