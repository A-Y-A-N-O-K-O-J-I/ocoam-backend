const db = require("../config/db");
const uploadBufferToCloudinary = require("../helpers/cloudinary");
const { sendApplicationConfirmationEmail } = require("../helpers/email");

const applicationController = {
  async submitApplication(req, res) {
    const userId = req.user.id;
    const userEmail = req.user.email;

    try {
      // Check if user already submitted an application
      const existingApplication = await db.query(
        "SELECT id FROM applications WHERE user_id = $1",
        [userId]
      );

      if (existingApplication.rows.length > 0) {
        return res.status(409).json({
          status: 409,
          message: "You have already submitted an application.",
        });
      }

      // Validate required fields
      const {
        programme,
        surname,
        firstname,
        dob,
        gender,
        state_of_origin,
        lga,
        marital_status,
        residential_address,
        phone_number,
        email,
        qualification_route,
        motivation,
        nok_name,
        nok_relationship,
        nok_phone,
        nok_address,
        payment_option,
        othername,
        alternative_phone,
        whatsapp_number,
        highest_qualification,
        institution_name,
        graduation_year,
        experience_years,
        tm_background,
        tm_experience,
        nok_email,
      } = req.body;

      // Validate required fields
      if (
        !programme ||
        !surname ||
        !firstname ||
        !dob ||
        !gender ||
        !state_of_origin ||
        !lga ||
        !marital_status ||
        !residential_address ||
        !phone_number ||
        !email ||
        !qualification_route ||
        !motivation ||
        !nok_name ||
        !nok_relationship ||
        !nok_phone ||
        !nok_address ||
        !payment_option
      ) {
        return res.status(400).json({
          status: 400,
          message: "All required fields must be filled.",
        });
      }

      // Validate programme selection
      if (!["professional", "advanced"].includes(programme)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid programme selection.",
        });
      }

      // Validate gender
      if (!["male", "female"].includes(gender)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid gender selection.",
        });
      }

      // Validate marital status
      if (!["single", "married", "divorced", "widowed"].includes(marital_status)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid marital status.",
        });
      }

      // Validate qualification route
      if (!["academic", "practice"].includes(qualification_route)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid qualification route.",
        });
      }

      // Validate payment option
      if (!["full", "three", "four"].includes(payment_option)) {
        return res.status(400).json({
          status: 400,
          message: "Invalid payment option.",
        });
      }

      // Validate required documents
      if (!req.files || !req.files.passport_photo || !req.files.birth_certificate_or_attestation) {
        return res.status(400).json({
          status: 400,
          message: "Passport photo and birth certificate/attestation are required.",
        });
      }

      // If academic route, school certificate is required
      if (qualification_route === "academic" && !req.files.school_certificate) {
        return res.status(400).json({
          status: 400,
          message: "School certificate is required for academic route.",
        });
      }

      // Upload documents to Cloudinary
      const documentUrls = {};
      const uploadedUrls = []; // Track uploads for rollback

      try {
        // Upload passport photo
        const passportPhotoUrl = await uploadBufferToCloudinary(
          req.files.passport_photo[0].buffer
        );
        documentUrls.passport_photo_url = passportPhotoUrl;
        uploadedUrls.push(passportPhotoUrl);

        // Upload birth certificate or attestation
        const birthCertUrl = await uploadBufferToCloudinary(
          req.files.birth_certificate_or_attestation[0].buffer
        );
        documentUrls.birth_certificate_or_attestation_url = birthCertUrl;
        uploadedUrls.push(birthCertUrl);

        // Upload school certificate if provided
        if (req.files.school_certificate) {
          const schoolCertUrl = await uploadBufferToCloudinary(
            req.files.school_certificate[0].buffer
          );
          documentUrls.school_certificate_url = schoolCertUrl;
          uploadedUrls.push(schoolCertUrl);
        }

        // Upload practice documentation if provided
        if (req.files.practice_documentation) {
          const practiceDocUrl = await uploadBufferToCloudinary(
            req.files.practice_documentation[0].buffer
          );
          documentUrls.practice_documentation_url = practiceDocUrl;
          uploadedUrls.push(practiceDocUrl);
        }

        // Upload medical fitness certificate if provided
        if (req.files.medical_fitness_certificate) {
          const medicalCertUrl = await uploadBufferToCloudinary(
            req.files.medical_fitness_certificate[0].buffer
          );
          documentUrls.medical_fitness_certificate_url = medicalCertUrl;
          uploadedUrls.push(medicalCertUrl);
        }

        // Upload recommendation letter if provided
        if (req.files.recommendation_letter) {
          const recLetterUrl = await uploadBufferToCloudinary(
            req.files.recommendation_letter[0].buffer
          );
          documentUrls.recommendation_letter_url = recLetterUrl;
          uploadedUrls.push(recLetterUrl);
        }

        // Upload additional certificates if provided
        if (req.files.additional_certificates) {
          const additionalCertsUrl = await uploadBufferToCloudinary(
            req.files.additional_certificates[0].buffer
          );
          documentUrls.additional_certificates_url = additionalCertsUrl;
          uploadedUrls.push(additionalCertsUrl);
        }
      } catch (uploadError) {
        console.error("Document upload error:", uploadError);
        // Rollback: Note - In production, you might want to delete uploaded files from Cloudinary
        return res.status(500).json({
          status: 500,
          message: "Failed to upload documents. Please try again.",
          error: uploadError.message,
        });
      }

      // Calculate pioneer discount (first 20 applicants)
      const applicationsCount = await db.query(
        "SELECT COUNT(*) as count FROM applications"
      );
      const count = parseInt(applicationsCount.rows[0].count);
const pioneer_discount_applied = count < 20 ? 1 : 0;
      // Get current timestamp
      const now = new Date();
      const createdAt = now.toISOString();
      const updatedAt = createdAt;

      // Insert application into database
      const result = await db.query(
        `INSERT INTO applications (
          user_id, programme, surname, firstname, othername, dob, gender,
          state_of_origin, lga, marital_status, residential_address,
          phone_number, alternative_phone, email, whatsapp_number,
          qualification_route, highest_qualification, institution_name,
          graduation_year, experience_years, tm_background, tm_experience,
          motivation, nok_name, nok_relationship, nok_phone, nok_email,
          nok_address, payment_option, pioneer_discount_applied,
          passport_photo_url, birth_certificate_or_attestation_url,
          school_certificate_url, practice_documentation_url,
          medical_fitness_certificate_url, recommendation_letter_url,
          additional_certificates_url, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
          $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39
        ) RETURNING id`,
        [
          userId,
          programme,
          surname,
          firstname,
          othername || null,
          dob,
          gender,
          state_of_origin,
          lga,
          marital_status,
          residential_address,
          phone_number,
          alternative_phone || null,
          email,
          whatsapp_number || null,
          qualification_route,
          highest_qualification || null,
          institution_name || null,
          graduation_year || null,
          experience_years || null,
          tm_background || null,
          tm_experience || null,
          motivation,
          nok_name,
          nok_relationship,
          nok_phone,
          nok_email || null,
          nok_address,
          payment_option,
          pioneer_discount_applied,
          documentUrls.passport_photo_url,
          documentUrls.birth_certificate_or_attestation_url,
          documentUrls.school_certificate_url || null,
          documentUrls.practice_documentation_url || null,
          documentUrls.medical_fitness_certificate_url || null,
          documentUrls.recommendation_letter_url || null,
          documentUrls.additional_certificates_url || null,
          createdAt,
          updatedAt,
        ]
      );

      const applicationId = result.rows[0].id;

      // Send confirmation email
      try {
        await sendApplicationConfirmationEmail(userEmail, applicationId, pioneer_discount_applied);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        status: 201,
        message: "Application submitted successfully!",
        application_id: applicationId,
        pioneer_discount_applied,
      });
    } catch (error) {
      console.error("Application submission error:", error);
      res.status(500).json({
        status: 500,
        message: "Failed to submit application. Please try again.",
        error: error.message,
      });
    }
  },

  async checkApplicationStatus(req, res) {
    const userId = req.user.id;

    try {
      const application = await db.query(
        "SELECT id, created_at, pioneer_discount_applied FROM applications WHERE user_id = $1",
        [userId]
      );

      if (application.rows.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "No application found.",
          has_applied: false,
        });
      }

      res.status(200).json({
        status: 200,
        has_applied: true,
        application: application.rows[0],
      });
    } catch (error) {
      console.error("Check application status error:", error);
      res.status(500).json({
        status: 500,
        message: "Failed to check application status.",
        error: error.message,
      });
    }
  },
};

module.exports = applicationController;