const KYCSubmission = require("../models/KYCSubmission");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// async function uploadKYCFile(file, folder) {
//   try {
//     const result = await cloudinary.uploader.upload(file.path, {
//       folder,
//       resource_type: "auto", // IMPORTANT: supports PDF + PNG + JPG
//     });

//     // remove temp file
//     if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

//     return {
//       type: file.mimetype,
//       url: result.secure_url,
//       fileName: result.original_filename,
//     };
//   } catch (err) {
//     console.error("CLOUDINARY ERROR", err);
//     throw err;
//   }
// }
// async function uploadToCloudinary(file) {
//   try {
//     const isPDF = file.mimetype === "application/pdf";

//     const result = await cloudinary.uploader.upload(file.path, {
//       folder: isPDF ? "mafa_kyc/cac_docs" : "mafa_kyc",
//       resource_type: isPDF ? "raw" : "image",
//     });

//     fs.unlinkSync(file.path);

//     return {
//       type: file.mimetype,
//       url: result.secure_url,
//       fileName: result.original_filename,
//     };
//   } catch (err) {
//     console.error("Cloudinary upload error:", err);
//     throw err;
//   }
// }

async function uploadToCloudinary(file) {
  try {
    const isPDF = file.mimetype === "application/pdf";

    const result = await cloudinary.uploader.upload(file.path, {
      folder: isPDF ? "mafa_kyc/cac_docs" : "mafa_kyc",
    //   resource_type: isPDF ? "raw" : "image",
    resource_type: "auto", // <--- THIS FIXES IT!
    });

    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    let url;

    if (isPDF) {
      // Cloudinary public_id sometimes ends WITHOUT extension, sometimes WITH extension
      const publicId = result.public_id;

      // If already ends with .pdf → don't add another .pdf
      if (publicId.endsWith(".pdf")) {
        url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}`;
      } else {
        url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}.pdf`;
      }
    } else {
      url = result.secure_url;
    }

    return {
      type: file.mimetype,
      url,
      fileName: result.original_filename,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

exports.submitCorporate = async (req, res) => {
  try {
    const user_id = req.user.id;

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const {
      company_name,
      representative_name,
      representative_email,
      representative_nin,
      representative_phone,
      representative_address,
    } = req.body;

    /* -----------------------------------------
       1️⃣ PARSE DIRECTORS FROM req.body
    ----------------------------------------- */
    const directors = [];

    Object.keys(req.body).forEach((key) => {
      const match = key.match(/directors\[(\d+)\]\[(\w+)\]/);
      if (match) {
        const index = match[1];
        const field = match[2];

        if (!directors[index]) directors[index] = {};
        directors[index][field] = req.body[key];
      }
    });

    /* -----------------------------------------
       2️⃣ UPLOAD FILES (CAC documents + director photos)
    ----------------------------------------- */
    const cacDocs = [];
    const directorPhotos = {};

    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file);

      // CAC documents
      if (file.fieldname === "cacDocuments") {
        cacDocs.push(uploaded);
      }

      // Director photos: directors[0][photo]
      const match = file.fieldname.match(/directors\[(\d+)\]\[photo\]/);
      if (match) {
        const index = match[1];
        directorPhotos[index] = uploaded.url;
      }
    }

    // Attach photos to directors
    directors.forEach((d, i) => {
      if (directorPhotos[i]) {
        d.photo = directorPhotos[i];
      }
    });

    /* -----------------------------------------
       3️⃣ SAVE FINAL SUBMISSION
    ----------------------------------------- */
    const submission = await KYCSubmission.create({
      user_id,
      customer_type: "corporate",
      kyc_status: "pending",

      representative: {
        company_name,
        representative_name,
        representative_email,
        representative_phone,
        representative_address,
        representative_nin,
      },

      directors,
      documents: cacDocs,
    });

    return res.json({ success: true, data: submission });

  } catch (err) {
    console.error("CORPORATE KYC ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error submitting corporate KYC",
    });
  }
};

// exports.submitCorporate = async (req, res) => {

//  try {
//     const user_id = req.user.id;

//     console.log("BODY:", req.body);
//     console.log("FILES:", req.files);

//     // Extract fields from body
//     const {
//       company_name,
//       representative_name,
//       representative_email,
//       representative_nin,
//     } = req.body;

//     // Directors (from form fields)
//     const directors = [];
//     if (req.body["directors"]) {
//       // When only one director exists, Express won't wrap it in an array
//       const raw = Array.isArray(req.body.directors)
//         ? req.body.directors
//         : [req.body.directors];

//       raw.forEach((d) => {
      
//         const uploaded = await uploadToCloudinary(file);
// documents.push(uploaded);
//       });
//     }

//     // Upload CAC Documents
//     const cacDocs = [];
//     const directorPhotos = {};

//     for (const file of req.files) {
//       const uploaded = await uploadToCloudinary(file);

//       if (file.fieldname === "cacDocuments") {
//         cacDocs.push(uploaded);
//       }

//       // Director photo: directors[0][photo]
//       if (file.fieldname.includes("directors")) {
//         const index = file.fieldname.match(/\[(\d+)\]/)[1];
//         if (!directorPhotos[index]) directorPhotos[index] = {};
//         directorPhotos[index].photo = uploaded.url;
//       }
//     }

//     // Attach photos to directors
//     Object.keys(directorPhotos).forEach((i) => {
//       if (directors[i]) {
//         directors[i].photo = directorPhotos[i].photo;
//       }
//     });

//     // Save submission
//     const submission = await KYCSubmission.create({
//       user_id,
//       customer_type: "corporate",
//       kyc_status: "pending",

//       representative: {
//         company_name,
//         representative_name,
//         representative_email,
//         representative_nin,
//       },

//       directors,           // <-- FIXED 🔥
//       documents: cacDocs,  // <-- FIXED 🔥
//     });

//     return res.json({ success: true, data: submission });

//   } catch (err) {
//     console.error("CORPORATE KYC ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error submitting corporate KYC",
//     });
//   }
// };























//   try {
//     const user_id = req.user.id;
//     const body = req.body;
//     const files = req.files;

//     console.log("BODY:", body);
//     console.log("FILES:", files);

//     // 🔹 Upload CAC docs
//     const cacDocs = files
//       .filter(f => f.fieldname === "cacDocuments")
//       .map(async (file) => {
//         return await uploadKYCFile(file, "mafa_kyc/cac_docs");
//       });

//     const uploadedCAC = await Promise.all(cacDocs);

//     // 🔹 Director info (parsed manually because form-data makes it nested)
//     const directors = [];

//     const directorCount = Object.keys(body).filter(k => k.startsWith("directors[")).length / 2;

//     for (let i = 0; i < directorCount; i++) {
//       const photoFile = files.find(
//         f => f.fieldname === `directors[${i}][photo]`
//       );

//       let uploadedPhoto = null;
//       if (photoFile) {
//         uploadedPhoto = await uploadKYCFile(photoFile, "mafa_kyc/directors");
//       }

//       directors.push({
//         full_name: body[`directors[${i}][full_name]`],
//         nin: body[`directors[${i}][nin]`],
//         photo: uploadedPhoto,
//       });
//     }

//     // 🔹 Save to DB
//     const submission = await KYCSubmission.create({
//       user_id,
//       customer_type: "corporate",
//       kyc_status: "pending",
//       representative: body,
//       documents: uploadedCAC,      // Cloudinary URLs
//       directors: directors,        // contains Cloudinary URLs
//     });

//     return res.json({ success: true, data: submission });

//   } catch (err) {
//     console.error("CORPORATE KYC ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Corporate KYC submission failed",
//       error: err.message,
//     });
//   }