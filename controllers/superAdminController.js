const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const SuperAdmin = require("../models/superAdminModel");
const {sendVerificationEmail, sendResetEmail} = require("../helpers/email");
const jwt = require("jsonwebtoken")

const superAdminController = {
async signupSuperAdmin (req, res){
  const {
    fullName,
    email,
    username,
    password,
    dob,
    gender,
    country,
    state,
    address,
    phone_number,
  } = req.body;

  // Check required fields
  if (
    !fullName || !email || !username || !password || !dob ||
    !gender || !country || !state || !address || !phone_number
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if super admin already exists
    const exists = await SuperAdmin.exists();
    if (exists) {
      return res.status(403).json({ message: "Super admin already created." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenCreatedAt = new Date().toISOString();

    // Create super admin
    const newAdmin = await SuperAdmin.create({
      full_name: fullName,
      email,
      username,
      password: hashedPassword,
      dob,
      gender,
      country,
      state,
      address,
      phone_number,
      verification_token: verificationToken,
      verification_token_created_at: verificationTokenCreatedAt,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken,"super-admin");

    return res.status(201).json({
      message: "Super admin created. Please verify email.",
    });

  } catch (err) {
    console.error("Super admin signup error:", err);
    return res.status(500).json({ message: "Server error." });
  }
},

async verifySuperAdminEmail(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ status: 400 });

  try {
    const admin = await SuperAdmin.findByToken(token);
    if (!admin) return res.status(400).json({ status: 400 });

    const tokenAge = new Date() - new Date(admin.verification_token_created_at);
    const fifteenMinutes = 15 * 60 * 1000;

    if (tokenAge > fifteenMinutes) {
      return res.status(410).json({ status: 410 }); // expired
    }

    await SuperAdmin.verifyEmail(admin.email);

    res.status(200).json({ status: 200, message: "Email verified" });
  } catch (error) {
    console.error("Super Admin email verification error:", error);
    res.status(500).json({ status: 500 });
  }
},


async reverifySuperAdminEmail(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: 400 });

  try {
    const admin = await SuperAdmin.findByEmail(email);
    if (!admin) return res.status(404).json({ status: 404 });

    if (admin.is_verified) {
      return res.status(409).json({ status: 409 }); // Already verified
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    await SuperAdmin.saveVerificationToken(email, newToken);

    await sendVerificationEmail(email, newToken);

    res.status(200).json({ status: 200, message: "Verification email sent" });
  } catch (error) {
    console.error("Super Admin reverify error:", error);
    res.status(500).json({ status: 500 });
  }
},

async loginSuperAdmin(req, res) {
  const { identifier, password } = req.body; // identifier = email or username

  if (!identifier || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const admin = await SuperAdmin.findByUsernameOrEmail(identifier);
    if (!admin) {
      return res.status(404).json({ message: "Super admin not found." });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!admin.is_verified) {
      return res.status(403).json({ message: "Email not verified." });
    }

const payload = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
		role:"super-admin"
      }
	const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"7d"})
    res.cookie("accessToken", token, {
  httpOnly: true,
  secure: false, // change to true when using HTTPS
  sameSite: "lax", // or "strict" or "none" depending on your frontend-backend setup
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/", // ✅ makes the cookie accessible on all routes
});

	res.status(200).json({
      message: "Login successful."
    });
  } catch (err) {
    console.error("Super admin login error:", err);
    res.status(500).json({ message: "Server error." });
  }
},

async forgotSuperAdminPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const admin = await SuperAdmin.findByEmail(email);
    if (!admin) {
      return res.status(404).json({ message: "Super admin not found." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await SuperAdmin.saveResetToken(admin.id, resetToken);

    await sendResetEmail(email, resetToken); // your existing function

    res.status(200).json({ message: "Password reset link sent to email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
},

async resetSuperAdminPasswordPost(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Missing token or password." });
  }

  try {
    const admin = await SuperAdmin.findByResetToken(token);
    if (!admin) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await SuperAdmin.updatePassword(admin.id, hashedPassword);

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Reset POST error:", err);
    res.status(500).json({ message: "Server error." });
  }
}


}
module.exports = superAdminController