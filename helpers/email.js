const nodemailer = require("nodemailer");

async function sendVerificationEmail(userEmail, token) {
    const transporter = nodemailer.createTransport({
        service: "yahoo",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: userEmail,
        subject: "Verify Your Email",
        text: `Click the link to verify your email: ${process.env.DOMAIN_NAME}/auth/verify-email?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
}

async function sendResetEmail(userEmail, token){
    const transporter = nodemailer.createTransport({
        service: "yahoo",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: userEmail,
        subject: "Update Password",
        text: `Click the link to verify your update: ${process.env.DOMAIN_NAME}/update-password?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendResetEmail }
