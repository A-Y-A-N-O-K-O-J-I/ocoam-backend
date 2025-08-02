const db = require("../config/db");
const User = require("../models/userModel");
const studentsController = {
  async dashboard(req, res) {
    try {
      const stats = await User.getStudentsStats();
      res.status(200).json({
        status: 200,
        message: "Dashboard data fetched successfully",
        data: {
          totalClasses: stats.total,
          scheduledClasses: stats.scheduled,
          liveClasses: stats.live,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Failed to load dashboard data",
        error: error.message,
      });
    }
  },
  async getStudentsList(req, res) {
    try {
      const students = await db.query(
        "select id,full_name,email,education_level,created_at from users where is_moderator = $1 and is_teacher = $2",
        [0, 0]
      );
      res.status(200).json({
        status: 200,
        students: students.rows,
      });
    } catch {
      res.status(500).json({
        status: 500,
        message: "An error occured",
      });
    }
  },
  async getTeacherList(req, res) {
  try {
    const teachers = await db.query(
      "SELECT id, full_name, email, education_level, created_at FROM users WHERE is_teacher = $1 AND is_moderator = $2",
      [1, 0]
    );

    res.status(200).json({
      status: 200,
      teachers: teachers.rows,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      status: 500,
      message: "An error occurred",
    });
  }
}

};
module.exports = studentsController;
