const KYCSubmission = require("../models/KYCSubmission");
const { User } = require("../models/user")
// const { User, KYCSubmission } = require("../models");
// console.log(User)
function parseJSON(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value; // return raw if not JSON
  }
}
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

async function uploadToCloudinary(file) {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "mafa_kyc",
    });

    // delete local temp file
    fs.unlinkSync(file.path);

    return {
      type: file.mimetype.split("/")[0],  // "image"
      url: result.secure_url,
      fileName: result.original_filename,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

module.exports = {
  /* ------------------------------------------------------------
     USER: GET CURRENT STATUS
  -------------------------------------------------------------*/
  async getStatus(req, res) {
    try {
      const user_id = req.user.id;
      const user = req.user;

      const submission = await KYCSubmission.findOne({
        where: { user_id },
      });

      // No submission yet
      if (!submission) {
        return res.json({
          success: true,
          data: {
            user_id,
            kyc_status: "not_submitted",
            customer_type: user.customer_type,
          },
        });
      }
      return res.json({
        success: true,
        data: {
          ...submission.dataValues,
          customer_type: user.customer_type,     // 🔥 DO NOT USE submission.customer_type
        },
      });
      // return res.json({ success: true, data: submission });
    } catch (err) {
      console.error("KYC STATUS ERROR", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  /* ------------------------------------------------------------
     USER: SUBMIT INDIVIDUAL KYC (WITH CLOUDINARY)
  -------------------------------------------------------------*/
  async submitIndividual(req, res) {
    try {
      const user_id = req.user.id;
      const { nin } = req.body;

      if (!nin) {
        return res.status(400).json({
          success: false,
          message: "NIN is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Photo is required",
        });
      }

      // 1️⃣ UPLOAD TO CLOUDINARY
      const uploadedPhoto = await uploadToCloudinary(req.file);

      // 2️⃣ CHECK IF USER ALREADY HAS A SUBMISSION
      let submission = await KYCSubmission.findOne({ where: { user_id } });

      if (!submission) {
        // 3️⃣ CREATE NEW SUBMISSION
        submission = await KYCSubmission.create({
          user_id,
          customer_type: "individual",
          kyc_status: "pending",

          representative: JSON.stringify({ nin }),

          documents: JSON.stringify([uploadedPhoto]),
        });

        return res.json({ success: true, data: submission });
      }

      // 4️⃣ UPDATE EXISTING SUBMISSION
      submission.customer_type = "individual";
      submission.kyc_status = "pending";
      submission.rejection_reason = null;

      submission.representative = JSON.stringify({ nin });

      submission.documents = JSON.stringify([uploadedPhoto]);

      await submission.save();

      return res.json({ success: true, data: submission });

    } catch (err) {
      console.error("KYC INDIVIDUAL SUBMISSION ERROR", err);
      return res.status(500).json({
        success: false,
        message: "Server error submitting KYC",
      });
    }
  }
  ,

  /* ------------------------------------------------------------
     USER: SUBMIT CORPORATE KYC
  -------------------------------------------------------------*/
  // async submitCorporate(req, res) {
  //     // try {
  //     //     const user_id = req.user.id;
  //     //     const { representative, directors } = req.body;

  //     //     const cacDocs = req.files?.cacDocuments?.map(f => ({
  //     //         type: "cac",
  //     //         url: f.path,
  //     //     })) || [];

  //     //     const directorPhotos = req.files?.directors?.map(f => ({
  //     //         directorIndex: f.fieldname.match(/\[(\d+)\]/)[1],
  //     //         url: f.path,
  //     //     })) || [];

  //     //     const submission = await KYCSubmission.create({
  //     //         user_id,
  //     //         customer_type: "corporate",
  //     //         representative: JSON.parse(representative),
  //     //         directors: JSON.parse(directors),
  //     //         documents: [...cacDocs, ...directorPhotos],
  //     //     });

  //     //     return res.json({ success: true, data: submission });
  //     // } catch (err) {
  //     //     console.error("SUBMIT CORPORATE ERROR", err);
  //     //     res.status(500).json({ success: false, message: "Server error" });
  //     // }

  //     try {
  //         const user_id = req.user.id;

  //         const {
  //             company_name,
  //             representative_name,
  //             representative_email,
  //             representative_nin,
  //         } = req.body;

  //         if (!company_name || !representative_name || !representative_nin) {
  //             return res.status(400).json({
  //                 success: false,
  //                 message: "Missing required representative/company info",
  //             });
  //         }

  //         /* -----------------------------
  //            1. Parse directors from body
  //         ------------------------------ */
  //         const directorsByIndex = {};

  //         Object.keys(req.body).forEach((key) => {
  //             const match = key.match(/^directors\[(\d+)\]\[(.+)\]$/);
  //             if (match) {
  //                 const index = match[1];
  //                 const field = match[2];
  //                 if (!directorsByIndex[index]) directorsByIndex[index] = {};
  //                 directorsByIndex[index][field] = req.body[key];
  //             }
  //         });

  //         let directors = Object.keys(directorsByIndex)
  //             .sort((a, b) => Number(a) - Number(b))
  //             .map((idx) => ({
  //                 full_name: directorsByIndex[idx].full_name || "",
  //                 nin: directorsByIndex[idx].nin || "",
  //                 photoUrl: null,
  //             }));

  //         /* -----------------------------
  //            2. Extract files from Cloudinary
  //         ------------------------------ */
  //         const files = req.files || [];

  //         const cacDocs = files
  //             .filter((f) => f.fieldname === "cacDocuments")
  //             .map((f) => ({
  //                 type: "cac",
  //                 url: f.path,
  //                 fileName: f.filename,
  //             }));

  //         files
  //             .filter((f) => /^directors\[\d+\]\[photo\]$/.test(f.fieldname))
  //             .forEach((f) => {
  //                 const index = f.fieldname.match(/\[(\d+)\]/)[1];
  //                 directors[index].photoUrl = f.path;
  //             });

  //         const representative = {
  //             full_name: representative_name,
  //             email: representative_email,
  //             nin: representative_nin,
  //             company_name,
  //         };

  //         const documents = [
  //             ...cacDocs,
  //             ...directors
  //                 .filter((d) => d.photoUrl)
  //                 .map((d) => ({
  //                     type: "director_photo",
  //                     url: d.photoUrl,
  //                     director: d.full_name,
  //                 })),
  //         ];

  //         /* -----------------------------
  //            3. Create or update submission
  //         ------------------------------ */
  //         const existing = await KYCSubmission.findOne({ where: { user_id } });

  //         if (!existing) {
  //             const created = await KYCSubmission.create({
  //                 user_id,
  //                 customer_type: "corporate",
  //                 kyc_status: "pending",
  //                 representative,
  //                 directors,
  //                 documents,
  //             });
  //             return res.json({ success: true, data: created });
  //         }

  //         existing.customer_type = "corporate";
  //         existing.kyc_status = "pending";
  //         existing.rejection_reason = null;
  //         existing.representative = representative;
  //         existing.directors = directors;
  //         existing.documents = documents;

  //         await existing.save();

  //         return res.json({ success: true, data: existing });
  //     } catch (err) {
  //         console.error("KYC CORPORATE SUBMISSION ERROR", err);
  //         return res
  //             .status(500)
  //             .json({ success: false, message: "Server error submitting corporate KYC" });
  //     }
  // },



  // ---------------------------------------------
  // CORPORATE KYC SUBMISSION
  // ---------------------------------------------
  // async submitCorporate(req, res) {
  //   try {
  //     const user_id = req.user.id;

  //     const {
  //       directors: directorsRaw,
  //       representative: representativeRaw,
  //     } = req.body;

  //     let directors = [];
  //     let representative = JSON.parse(representativeRaw);
  //     let directorList = JSON.parse(directorsRaw);

  //     // ------------------------------
  //     // HANDLE CAC DOCUMENTS
  //     // ------------------------------
  //     const cacFiles = req.files.filter(f => f.fieldname === "cacDocuments");

  //     if (cacFiles.length === 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Upload at least one CAC document.",
  //       });
  //     }

  //     if (cacFiles.length > 4) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Maximum 4 CAC documents allowed.",
  //       });
  //     }

  //     const cacDocuments = [];
  //     for (let file of cacFiles) {
  //       const uploaded = await uploadFile(file, "mafa_kyc/cac_docs");
  //       cacDocuments.push(uploaded);
  //     }

  //     // ------------------------------
  //     // HANDLE DIRECTORS
  //     // ------------------------------
  //     for (let i = 0; i < directorList.length; i++) {
  //       let d = directorList[i];

  //       const photoFile = req.files.find(
  //         f => f.fieldname === `director_photo_${i}`
  //       );

  //       let photoUploaded = null;
  //       if (photoFile) {
  //         photoUploaded = await uploadFile(photoFile, "mafa_kyc/directors");
  //       }

  //       directors.push({
  //         full_name: d.full_name,
  //         nin: d.nin,
  //         phone: d.phone,
  //         email: d.email,
  //         address: d.address,
  //         photo: photoUploaded,
  //       });
  //     }

  //     // ------------------------------
  //     // SAVE TO DB
  //     // ------------------------------
  //     const existing = await KYCSubmission.findOne({ where: { user_id } });

  //     if (!existing) {
  //       const created = await KYCSubmission.create({
  //         user_id,
  //         customer_type: "corporate",
  //         kyc_status: "pending",
  //         rejection_reason: null,
  //         documents: cacDocuments,
  //         directors,
  //         representative,
  //       });

  //       return res.json({ success: true, data: created });
  //     }

  //     // UPDATE ENTRY
  //     existing.customer_type = "corporate";
  //     existing.kyc_status = "pending";
  //     existing.rejection_reason = null;
  //     existing.documents = cacDocuments;
  //     existing.directors = directors;
  //     existing.representative = representative;

  //     await existing.save();

  //     return res.json({ success: true, data: existing });

  //   } catch (err) {
  //     console.error("CORPORATE KYC SUBMIT ERROR:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server error submitting corporate KYC",
  //     });
  //   }
  // },

  // this one is workign 
  //   async submitCorporate(req, res) {
  //   try {
  //     const user_id = req.user.id;

  //     console.log("BODY:", req.body);
  //     console.log("FILES:", req.files);

  //     /* ---------------------------------------------------------
  //        1. Extract representative fields
  //     ---------------------------------------------------------*/
  //     const representative = {
  //       full_name: req.body.representative_name,
  //       email: req.body.representative_email,
  //       nin: req.body.representative_nin,
  //     };

  //     /* ---------------------------------------------------------
  //        2. Extract directors from FormData style:
  //           directors[0][full_name]
  //           directors[0][nin]
  //           directors[0][photo] ← file
  //     ---------------------------------------------------------*/
  //     const directors = [];
  //     const dirMap = {};

  //     // Build a map like: { 0: { full_name: x, nin: y } }
  //     for (const key of Object.keys(req.body)) {
  //       const match = key.match(/^directors\[(\d+)\]\[(\w+)\]$/);
  //       if (match) {
  //         const index = Number(match[1]);
  //         const field = match[2];

  //         if (!dirMap[index]) dirMap[index] = {};
  //         dirMap[index][field] = req.body[key];
  //       }
  //     }

  //     // Attach photo files
  //     req.files.forEach((file) => {
  //       const match = file.fieldname.match(/^directors\[(\d+)\]\[photo\]$/);
  //       if (match) {
  //         const index = Number(match[1]);

  //         if (!dirMap[index]) dirMap[index] = {};

  //         dirMap[index].photoFile = file; // store multer file
  //       }
  //     });

  //     /* ---------------------------------------------------------
  //        3. Upload Director Photos to Cloudinary
  //     ---------------------------------------------------------*/
  //     for (const index of Object.keys(dirMap)) {
  //       const d = dirMap[index];
  //       let photoUrl = null;

  //       if (d.photoFile) {
  //         const upload = await cloudinary.uploader.upload(d.photoFile.path, {
  //           folder: "mafa_kyc/directors",
  //           resource_type: "auto",
  //         });

  //         fs.unlinkSync(d.photoFile.path);

  //         photoUrl = upload.secure_url;
  //       }

  //       directors.push({
  //         full_name: d.full_name,
  //         nin: d.nin,
  //         phone: d.phone || "",
  //         email: d.email || "",
  //         photo: photoUrl,
  //       });
  //     }

  //     /* ---------------------------------------------------------
  //        4. Upload CAC Documents
  //     ---------------------------------------------------------*/
  //     const cacDocs = [];

  //     const cacFiles = req.files.filter(
  //       (file) => file.fieldname === "cacDocuments"
  //     );

  //     for (const file of cacFiles) {
  //       const uploaded = await cloudinary.uploader.upload(file.path, {
  //         folder: "mafa_kyc/cac_docs",
  //         resource_type: "auto",
  //       });

  //       fs.unlinkSync(file.path);

  //       cacDocs.push({
  //         type: file.mimetype,
  //         url: uploaded.secure_url,
  //         fileName: uploaded.original_filename,
  //       });
  //     }

  //     /* ---------------------------------------------------------
  //        5. Save submission
  //     ---------------------------------------------------------*/
  //     const submission = await KYCSubmission.create({
  //       user_id,
  //       customer_type: "corporate",
  //       kyc_status: "pending",
  //       representative,
  //       directors,
  //       documents: cacDocs,
  //     });

  //     return res.json({ success: true, data: submission });

  //   } catch (err) {
  //     console.error("CORPORATE KYC ERROR:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server error submitting corporate KYC",
  //     });
  //   }
  // }


  // this one work s
  // async submitCorporate(req, res) {
  //   try {
  //     const user_id = req.user.id;

  //     console.log("BODY:", req.body);
  //     console.log("FILES:", req.files);

  //     /* --------------------------------------------------------
  //        1️⃣ Representative
  //     ---------------------------------------------------------*/
  //     const representative = {
  //       full_name: req.body.representative_name,
  //       email: req.body.representative_email,
  //       nin: req.body.representative_nin,
  //     };

  //     /* --------------------------------------------------------
  //        2️⃣ Directors (from req.body + req.files)
  //           Example field names:
  //           directors[0][full_name]
  //           directors[0][nin]
  //           directors[0][photo] → multer file
  //     ---------------------------------------------------------*/
  //     const directors = [];
  //     const dirTemp = {}; // temporary map to build directors

  //     // Build director data from req.body
  //     for (const key of Object.keys(req.body)) {
  //       const match = key.match(/^directors\[(\d+)\]\[(\w+)\]$/);
  //       if (match) {
  //         const index = Number(match[1]);
  //         const field = match[2];

  //         if (!dirTemp[index]) dirTemp[index] = {};
  //         dirTemp[index][field] = req.body[key];
  //       }
  //     }

  //     // Attach director photo files
  //     req.files.forEach((file) => {
  //       const match = file.fieldname.match(/^directors\[(\d+)\]\[photo\]$/);
  //       if (match) {
  //         const index = Number(match[1]);

  //         if (!dirTemp[index]) dirTemp[index] = {};
  //         dirTemp[index].photoFile = file;
  //       }
  //     });

  //     // Upload director photos to Cloudinary
  //     for (const index in dirTemp) {
  //       const d = dirTemp[index];
  //       let photoUrl = null;

  //       if (d.photoFile) {
  //         const uploaded = await cloudinary.uploader.upload(d.photoFile.path, {
  //           folder: "mafa_kyc/directors",
  //           resource_type: "auto",
  //         });

  //         if (fs.existsSync(d.photoFile.path)) fs.unlinkSync(d.photoFile.path);
  //         photoUrl = uploaded.secure_url;
  //       }

  //       directors.push({
  //         full_name: d.full_name,
  //         nin: d.nin,
  //         email: d.email || "",
  //         phone: d.phone || "",
  //         photo: photoUrl,
  //       });
  //     }

  //     /* --------------------------------------------------------
  //        3️⃣ CAC Documents (4 max)
  //     ---------------------------------------------------------*/
  //     const cacDocs = [];
  //     const cacFiles = req.files.filter((f) => f.fieldname === "cacDocuments");

  //     for (const file of cacFiles) {
  //       const uploaded = await cloudinary.uploader.upload(file.path, {
  //         folder: "mafa_kyc/cac_docs",
  //         resource_type: "auto",
  //       });

  //       if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  //       cacDocs.push({
  //         type: file.mimetype,
  //         url: uploaded.secure_url,
  //         fileName: uploaded.original_filename,
  //       });
  //     }

  //     /* --------------------------------------------------------
  //        4️⃣ Save to database
  //     ---------------------------------------------------------*/
  //     const submission = await KYCSubmission.create({
  //       user_id,
  //       customer_type: "corporate",
  //       kyc_status: "pending",
  //       representative,
  //       directors,
  //       documents: cacDocs,
  //     });

  //     return res.json({ success: true, data: submission });

  //   } catch (err) {
  //     console.error("CORPORATE KYC ERROR:", err);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server error submitting corporate KYC",
  //       error: err.message,
  //     });
  //   }
  // }

  /* ------------------------------------------------------------
     ADMIN: GET ALL SUBMISSIONS
  -------------------------------------------------------------*/
  // async getAllSubmissions(req, res) {
  //     try {
  //         const submissions = await KYCSubmission.findAll({
  //             include: [{ model: User, attributes: ["name", "email", "customer_type"] }],
  //             order: [["createdAt", "DESC"]],
  //         });

  //         return res.json({ success: true, data: submissions });
  //     } catch (err) {
  //         console.error("FETCH SUBMISSIONS ERROR", err);
  //         res.status(500).json({ success: false, message: "Server Error" });
  //     }
  // },

  async getAllSubmissions(req, res) {
    try {
      // 1️⃣ Fetch all submissions
      const submissions = await KYCSubmission.findAll({
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      if (!submissions.length) {
        return res.json({ success: true, data: [] });
      }

      // 2️⃣ Collect all user_ids
      const userIds = submissions.map((s) => s.user_id);

      // 3️⃣ Fetch users
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ["id", "name", "email", "phone", "customer_type"],
        raw: true,
      });

      // 4️⃣ Merge user + parsed JSON KYC data
      const finalData = submissions.map((sub) => {
        const user = users.find((u) => u.id === sub.user_id) || null;

        return {
          ...sub,

          // Parse JSON fields only if they exist
          representative: parseJSON(sub.representative),
          directors: parseJSON(sub.directors),
          documents: parseJSON(sub.documents),

          user,
        };
      });

      return res.json({
        success: true,
        data: finalData,
      });

    } catch (err) {
      console.error("FETCH SUBMISSIONS ERROR", err);
      return res.status(500).json({
        success: false,
        message: "Server error fetching submissions",
      });
    }
  }
  ,
  /* ------------------------------------------------------------
     ADMIN: APPROVE KYC
  -------------------------------------------------------------*/
  async approveKYC(req, res) {
    try {
      const { userId, notes } = req.body;

      const submission = await KYCSubmission.findOne({ where: { user_id: userId } });
      if (!submission) return res.status(404).json({ success: false, message: "Not found" });

      submission.kyc_status = "approved";
      submission.rejection_reason = null;
      await submission.save();

      return res.json({ success: true, message: "KYC approved" });
    } catch (err) {
      console.error("KYC APPROVE ERROR", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /* ------------------------------------------------------------
     ADMIN: REJECT KYC
  -------------------------------------------------------------*/
  async rejectKYC(req, res) {
    try {
      const { userId, notes } = req.body;

      const submission = await KYCSubmission.findOne({ where: { user_id: userId } });
      if (!submission) return res.status(404).json({ success: false, message: "Not found" });

      submission.kyc_status = "rejected";
      submission.rejection_reason = notes;
      await submission.save();

      return res.json({ success: true, message: "KYC rejected" });
    } catch (err) {
      console.error("KYC REJECT ERROR", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
