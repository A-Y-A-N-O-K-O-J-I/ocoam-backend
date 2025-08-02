const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendVerificationEmail, sendResetEmail } = require("../helpers/email");
const authController = {
  async signup(req, res) {
    const {
      fullName,
      email,
      username,
      password,
      education_level,
      dob,
      address,
      gender,
      country,
      state,
      phone_number,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !username ||
      !password ||
      !education_level ||
      !dob ||
      !address ||
      !gender ||
      !country ||
      !phone_number
    ) {
      return res
        .status(400)
        .json({ status: 400, message: "All fields are required." });
    }

    const checkEmail = await User.checkEmail(email);
    const checkUsername = await User.checkUsername(username);
    if (checkEmail) {
      res.status(409).json({
        status: 409,
        message: "User with that email Already exists",
      });
      return;
    }

    if (checkUsername) {
      res.status(409).json({
        status: 409,
        message: "User with that username Already exists",
      });
      return;
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate a unique verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      //Setting created at manually since i hate using NOW() function cuz sqlite doesn't have it too
      const now = new Date();
      const createdAt = now.toISOString();
      // Save user with the token
      const newUser = await User.create(
        fullName,
        email,
        username,
        hashedPassword,
        education_level,
        verificationToken,
        dob,
        address,
        gender,
        country,
        state,
        phone_number,
        createdAt
      );

      // Send verification email
      //console.log("Successfully Generated Verification token",verificationToken)
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        status: 201,
        message: "Signup successful. Please check your email for verification.",
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ status: 500, message: "Internal server error." });
    }
  },
  async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ status: 400, message: "Username and password are required." });
    }

    try {
      const user = await User.findByUsernameOrEmail(username);
      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "Invalid username/email or password.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: 400,
          message: "Invalid username/email or password.",
        });
      }
      // Check if the user is verified
      if (!user.is_verified) {
        return res.status(403).json({
          status: 403,
          message: "Please verify your email before logging in.",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username,email:user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // change to true when using HTTPS
        sameSite: "lax", // or "strict" or "none" depending on your frontend-backend setup
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/", // ✅ makes the cookie accessible on all routes
      });
      const isAModerator = await User.isModerator(user.id)
      if(isAModerator){
        res.status(200).json({ status: 200, message: "Login Successful",moderator:true });
      } else {
        res.status(200).json({ status: 200, message: "Login Successful",moderator:false });
      }

    } catch (error) {
      console.error("we got this", error);
      res.status(500).json({ status: 500, message: "Internal server error." });
    }
  },

  async verifyToken(req, res) {
    try {
      // `authMiddleware` don already check token and put user details inside `req.user`
      const user = await User.findById(req.user.id);
      if (!user) {
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/", // ✅ makes the cookie accessible on all routes
        });
        res.status(404).json({ status: 404, message: "User not found" });
        return;
      }
const isAModerator = await User.isModerator(user.id)
      // Return user info
      res.status(200).json({
        status: 200,
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        moderator:isAModerator
      });
    } catch (error) {
      console.log("token error", error);
      res.status(500).json({ status: 500, message: "Internal server error." });
    }
  },
  async verifyModeratorToken(req, res) {
    try {
      // `authMiddleware` don already check token and put user details inside `req.user`
      const user = await User.findById(req.user.id);
      if (!user) {
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/", // ✅ makes the cookie accessible on all routes
        });
        res.status(404).json({ status: 404, message: "User not found" });
        return;
      }

      const isModerator = await User.isModerator(req.user.id);
      if (!isModerator) {
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/", // ✅ makes the cookie accessible on all routes
        });
        res.status(404).json({ status: 403, message: "Access Denied" });
        return;
      }

      // Return user info
      res.status(200).json({
        status: 200,
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
      });
    } catch (error) {
      console.log("token error", error);
      res.status(500).json({ status: 500, message: "Internal server error." });
    }
  },

  async verifyEmail(req, res) {
    const { token } = req.body;
    if (!token) return res.status(400).json({ status: 400 });

    try {
      // Find user by token
      const user = await User.findByVerificationToken(token);
      console.log(user);
      if (!user)
        return res.status(400).json({ status: 400, message: "User not found" });

      // Check if token is expired
      const tokenAge =
        new Date() - new Date(user.verification_token_created_at);
      const fifteenMinutes = 60 * 60 * 1000; // 120000

      if (tokenAge > fifteenMinutes) {
        return res.status(410).json({ status: 410 });
      }

      // Mark user as verified
      await User.verifyUser(user.id);

      res.status(200).json({ status: 200 });
    } catch (error) {
      console.error("We got it", error);
      res.status(500).json({ status: 500 });
    }
  },

  async reverifyEmail(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 400 });

    try {
      const user = await User.findByEmail(email);
      if (!user) return res.status(404).json({ status: 404 });

      // If already verified, no need to send new token
      if (user.is_verified) {
        return res.status(409).json({ status: 409 }); // 409: Conflict (already verified)
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Update user with new token and timestamp
      await User.updateVerificationToken(user.id, verificationToken);

      // Send new verification email
      await sendVerificationEmail(email, verificationToken);

      res.status(200).json({ status: 200 });
    } catch (error) {
      console.error("Reverify email error: ", error);
      res.status(500).json({ status: 500 });
    }
  },
  async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: 400, message: "Email is required." });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res
          .status(404)
          .json({ status: 404, message: "User not found." });
      }

      // Generate a password reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Save token in the database
      await User.saveResetToken(user.id, resetToken);

      // Send reset link via email
      console.log("Forget password token", resetToken);
      //await sendResetEmail(email, resetToken);

      res
        .status(200)
        .json({ status: 200, message: "Password reset link sent to email." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ status: 500, message: "Internal server error." });
    }
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ status: 400, message: "Token and new password are required." });
    }

    try {
      // Find user by reset token
      const user = await User.findByResetToken(token);
      if (!user)
        return res
          .status(400)
          .json({ status: 400, message: "Invalid or expired token." });

      // Check if token has expired
      const tokenAge = new Date() - new Date(user.reset_token_created_at);
      const fifteenMinutes = 60 * 60 * 1000;
      if (tokenAge > fifteenMinutes) {
        // 15 minutes
        return res
          .status(410)
          .json({ status: 410, message: "Invalid or expired token." });
      }

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.updatePassword(user.id, hashedPassword);

      // Clear reset token after successful password update
      await User.clearResetToken(user.id);

      res
        .status(200)
        .json({ status: 200, message: "Password reset successful." });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Internal server error." });
    }
  },

  async becomeModerator(req, res) {
    const { key } = req.body;
    if (key !== process.env.MODERATOR_KEY) {
      return res.status(401).json({ message: "Invalid key" });
    }
    const isAModerator = await User.isModerator(req.user.id);
    if (isAModerator) {
      return res.status(409).json({
        status: 409,
        message: "User Already A moderator",
      });
    }
    try {
      await db.query("UPDATE users SET is_moderator = $1 WHERE id = $2", [
        1,
        req.user.id,
      ]);
      return res.status(200).json({status:200, message: "You are now a moderator" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  },

  async logout(req, res) {
    // Clear the auth cookie by setting it to expire immediately
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // ✅ makes the cookie accessible on all routes
    });

    return res.status(200).json({ message: "Logged out successfully" });
  },
};

module.exports = authController;
