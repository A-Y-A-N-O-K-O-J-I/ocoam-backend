const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendVerificationEmail, sendResetEmail} = require("../helpers/email")
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
       phone_number
     }  = req.body;
     
    if (!fullName || !email || !username || !password || !education_level || !dob || !address || !gender || !country || !state || !phone_number) {
        return res.status(400).json({ status: 400, message: "All fields are required." });
    }

    const checkEmail = await User.checkEmail(email);
    const checkUsername = await User.checkUsername(username)
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
//Setting created at manually since i hate using NOW() function cuz sqlite doesn't have it too
const now = new Date();
const createdAt = now.toISOString()
        // Save user with the token
        const newUser = await User.create(fullName, email, username, hashedPassword,education_level,verificationToken, dob,address, gender, country, state,phone_number,createdAt);

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ status: 201, message: "Signup successful. Please check your email for verification." });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ status: 500, message: "Internal server error." });
    }
},
   async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ status: 400, message: "Username and password are required." });
    }

    try {
        const user = await User.findByUsernameOrEmail(username);
        if (!user) {
            return res.status(400).json({ status: 400, message: "Invalid username/email or password." });
        }

        // Check if the user is verified
        if (!user.is_verified) {
            return res.status(403).json({ status: 403, message: "Please verify your email before logging in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: "Invalid username/email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        
            expiresIn: "7d",
        });
        res.cookie("accessToken", token, {
  httpOnly: true,
  secure: false, // change to true when using HTTPS
  sameSite: "none", // or "strict" or "none" depending on your frontend-backend setup
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/", // ✅ makes the cookie accessible on all routes
});

        res.status(200).json({ status: 200, message:"Login Successful" });
    } catch (error) {
        console.error("we got this",error)
        res.status(500).json({ status: 500, message: "Internal server error." });
    }
},

    async verifyToken(req, res) {
        try {
            // `authMiddleware` don already check token and put user details inside `req.user`
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ status: 404, message: "User not found" });
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
	console.log("token error",error);
            res.status(500).json({ status: 500, message: "Internal server error." });
        }
    },
    
      async verifyEmail(req, res) {
    const { token } = req.query;
    if (!token) return res.status(400).json({ status: 400 });

    try {
        // Find user by token
        const user = await User.findByVerificationToken(token);
        if (!user) return res.status(400).json({ status: 400 });

        // Check if token is expired
        const tokenAge = new Date() - new Date(user.verification_token_created_at);
        const twoMinutes = 2 * 60 * 1000; // 120000

        if (tokenAge > twoMinutes) {
            return res.status(410).json({ status: 410 });
        }

        // Mark user as verified
        await User.verifyUser(user.id);

        res.status(200).json({ status: 200 });
    } catch (error) {
    	console.error("We got it",error);
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
        res.status(500).json({ status: 500 });
    }
},
	async forgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: 400, message: "Email is required." });
        }

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({ status: 404, message: "User not found." });
            }

            // Generate a password reset token
            const resetToken = crypto.randomBytes(32).toString("hex");

            // Save token in the database
            await User.saveResetToken(user.id, resetToken);

            // Send reset link via email
            await sendResetEmail(email, resetToken);

            res.status(200).json({ status: 200, message: "Password reset link sent to email." });
        } catch (error) {
            console.error("Forgot password error:", error);
            res.status(500).json({ status: 500, message: "Internal server error." });
        }
    },

async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ status: 400, message: "Token and new password are required." });
        }

        try {
            // Find user by reset token
            const user = await User.findByResetToken(token);
            if (!user) return res.status(400).json({ status: 400, message: "Invalid or expired token." });

            // Check if token has expired
            const tokenAge = new Date() - new Date(user.reset_token_created_at);
            if (tokenAge > 3600000) { // 1 hour
                return res.status(410).json({ status: 410, message: "Token expired." });
            }

            // Hash new password and update user
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(user.id, hashedPassword);

            // Clear reset token after successful password update
            await User.clearResetToken(user.id);

            res.status(200).json({ status: 200, message: "Password reset successful." });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Internal server error." });
        }
    },
    async updatePasswordPage(req, res) {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send("Invalid or missing token.");
    }

    try {
        // Verify token
        const user = await User.findByResetToken(token);
        if (!user) {
            return res.status(400).send("Invalid or expired token.");
        }

        // Serve an HTML page with an input for the new password
        res.send(`
            <form id="resetForm">
    <input type="hidden" id="token" value="${token}" />
    <label>New Password:</label>
    <input type="password" id="newPassword" required />
    <button type="submit">Reset Password</button>
</form>

<script>
    document.getElementById("resetForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent normal form submission

        const token = document.getElementById("token").value;
        const newPassword = document.getElementById("newPassword").value;

        const response = await fetch("/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword })
        });

        const result = await response.json();
        alert(result.message);
    });
</script>        `);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
}
};

module.exports = authController;
