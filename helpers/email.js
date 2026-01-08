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


async function sendApplicationConfirmationEmail(userEmail, applicationId, pioneerDiscount) {
  const transporter = nodemailer.createTransport({
    service: "yahoo",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const discountMessage = pioneerDiscount
    ? "\n\n🎉 CONGRATULATIONS! You are among our first 20 applicants and have automatically received the Pioneer Cohort Discount of ₦30,000!"
    : "";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Application Submitted Successfully - Oduduwa College of Yoruba Medicine",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #1a472a; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #1a472a 0%, #2d5016 100%); color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 24px;">Oduduwa College of Yoruba Medicine</h1>
          <p style="margin: 5px 0; font-style: italic;">Preserving Heritage • Advancing Knowledge • Healing Communities</p>
        </div>

        <div style="padding: 20px; background: #f9f9f9; margin-top: 20px; border-radius: 8px;">
          <h2 style="color: #1a472a; margin-top: 0;">Application Received! 🎓</h2>
          
          <p>Dear Applicant,</p>
          
          <p>Thank you for submitting your application to Oduduwa College of Yoruba Medicine for the <strong>March 2026 session</strong>.</p>
          
          <div style="background: #fff; padding: 15px; border-left: 4px solid #1a472a; margin: 20px 0;">
            <p style="margin: 0;"><strong>Your Application ID:</strong> ${applicationId}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Please keep this ID for reference.</p>
          </div>
          ${discountMessage ? `
          <div style="background: #ffd700; padding: 15px; border: 3px solid #8b4513; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #1a472a; font-size: 16px;">${discountMessage}</p>
          </div>
          ` : ''}
          
          <h3 style="color: #1a472a; margin-top: 25px;">What's Next?</h3>
          <ol style="line-height: 1.8;">
            <li>Our admissions team will review your application within 5-7 business days</li>
            <li>You will receive an email notification about your admission status</li>
            <li>If admitted, you will receive payment instructions and orientation details</li>
          </ol>

          <h3 style="color: #1a472a; margin-top: 25px;">Need Help?</h3>
          <p>For any inquiries or additional information, please contact us:</p>
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 5px 0;">📱 <strong>WhatsApp/Call:</strong> +234 802 298 1214</p>
            <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${process.env.EMAIL_USER}</p>
            <p style="margin: 5px 0;">🏢 <strong>Address:</strong> No. 1, Oke-Eruru, Ijebu-Jesa, Osun State</p>
          </div>

          <p style="margin-top: 25px;">We look forward to welcoming you to our pioneer cohort!</p>
          
          <p style="margin-top: 20px;">
            Best regards,<br>
            <strong>Admissions Office</strong><br>
            Oduduwa College of Yoruba Medicine
          </p>
        </div>

        <div style="text-align: center; padding: 15px; color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd;">
          <p style="margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 5px 0;">© 2026 Oduduwa College of Yoruba Medicine. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
Application Submitted Successfully - Oduduwa College of Yoruba Medicine

Dear Applicant,

Thank you for submitting your application to Oduduwa College of Yoruba Medicine for the March 2026 session.

Your Application ID: ${applicationId}
Please keep this ID for reference.
${discountMessage}

What's Next?
1. Our admissions team will review your application within 5-7 business days
2. You will receive an email notification about your admission status
3. If admitted, you will receive payment instructions and orientation details

Need Help?
For any inquiries or additional information, please contact us:
📱 WhatsApp/Call: +234 802 298 1214
📧 Email: ${process.env.EMAIL_USER}
🏢 Address: No. 1, Oke-Eruru, Ijebu-Jesa, Osun State

We look forward to welcoming you to our pioneer cohort!

Best regards,
Admissions Office
Oduduwa College of Yoruba Medicine

---
This is an automated message. Please do not reply to this email.
© 2026 Oduduwa College of Yoruba Medicine. All rights reserved.
    `,
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

module.exports = { sendVerificationEmail, sendResetEmail,sendApplicationConfirmationEmail }
