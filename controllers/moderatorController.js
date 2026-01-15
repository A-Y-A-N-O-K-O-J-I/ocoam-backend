const { message } = require("telegraf/filters");
const db = require("../config/db");
const User = require("../models/userModel");
const moderatorController = {
  async dashboard(req, res) {
    try {
      const list = await User.getDashboardInfo();
      const studentCount = list.students.rows[0];
      const teacherCount = list.teacher.rows[0];
      const classesCount = list.classes.rows[0];

      res.status(200).json([studentCount, teacherCount, classesCount]);
    } catch {
      res.status(500).json({
        status: 500,
        message: "An error occured",
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
    } catch(error){
      console.log("Student count error", error)
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
},
async getProfileInfo(req,res){
  try {
    const moderatorInfo = await db.query("SELECT * FROM users WHERE id = $1 AND is_moderator = $2",[req.user.id,1]);
    if(moderatorInfo.rows.length === 0){
      return res.status(404).json({
        status:404,
        message:"User was not found"
      })
    }
    res.json({
      status:200,
      profile:moderatorInfo.rows[0]
    })
  } catch (error) {
    res.status(500).json({
      status:500,
      message:"An error Occured"
    })
  }
}
};
module.exports = moderatorController;
