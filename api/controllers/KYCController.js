const KYCSubmission = require("../models/KYCSubmission");
const {User} = require("../models/user")
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
    async submitCorporate(req, res) {
        // try {
        //     const user_id = req.user.id;
        //     const { representative, directors } = req.body;

        //     const cacDocs = req.files?.cacDocuments?.map(f => ({
        //         type: "cac",
        //         url: f.path,
        //     })) || [];

        //     const directorPhotos = req.files?.directors?.map(f => ({
        //         directorIndex: f.fieldname.match(/\[(\d+)\]/)[1],
        //         url: f.path,
        //     })) || [];

        //     const submission = await KYCSubmission.create({
        //         user_id,
        //         customer_type: "corporate",
        //         representative: JSON.parse(representative),
        //         directors: JSON.parse(directors),
        //         documents: [...cacDocs, ...directorPhotos],
        //     });

        //     return res.json({ success: true, data: submission });
        // } catch (err) {
        //     console.error("SUBMIT CORPORATE ERROR", err);
        //     res.status(500).json({ success: false, message: "Server error" });
        // }

        try {
            const user_id = req.user.id;

            const {
                company_name,
                representative_name,
                representative_email,
                representative_nin,
            } = req.body;

            if (!company_name || !representative_name || !representative_nin) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required representative/company info",
                });
            }

            /* -----------------------------
               1. Parse directors from body
            ------------------------------ */
            const directorsByIndex = {};

            Object.keys(req.body).forEach((key) => {
                const match = key.match(/^directors\[(\d+)\]\[(.+)\]$/);
                if (match) {
                    const index = match[1];
                    const field = match[2];
                    if (!directorsByIndex[index]) directorsByIndex[index] = {};
                    directorsByIndex[index][field] = req.body[key];
                }
            });

            let directors = Object.keys(directorsByIndex)
                .sort((a, b) => Number(a) - Number(b))
                .map((idx) => ({
                    full_name: directorsByIndex[idx].full_name || "",
                    nin: directorsByIndex[idx].nin || "",
                    photoUrl: null,
                }));

            /* -----------------------------
               2. Extract files from Cloudinary
            ------------------------------ */
            const files = req.files || [];

            const cacDocs = files
                .filter((f) => f.fieldname === "cacDocuments")
                .map((f) => ({
                    type: "cac",
                    url: f.path,
                    fileName: f.filename,
                }));

            files
                .filter((f) => /^directors\[\d+\]\[photo\]$/.test(f.fieldname))
                .forEach((f) => {
                    const index = f.fieldname.match(/\[(\d+)\]/)[1];
                    directors[index].photoUrl = f.path;
                });

            const representative = {
                full_name: representative_name,
                email: representative_email,
                nin: representative_nin,
                company_name,
            };

            const documents = [
                ...cacDocs,
                ...directors
                    .filter((d) => d.photoUrl)
                    .map((d) => ({
                        type: "director_photo",
                        url: d.photoUrl,
                        director: d.full_name,
                    })),
            ];

            /* -----------------------------
               3. Create or update submission
            ------------------------------ */
            const existing = await KYCSubmission.findOne({ where: { user_id } });

            if (!existing) {
                const created = await KYCSubmission.create({
                    user_id,
                    customer_type: "corporate",
                    kyc_status: "pending",
                    representative,
                    directors,
                    documents,
                });
                return res.json({ success: true, data: created });
            }

            existing.customer_type = "corporate";
            existing.kyc_status = "pending";
            existing.rejection_reason = null;
            existing.representative = representative;
            existing.directors = directors;
            existing.documents = documents;

            await existing.save();

            return res.json({ success: true, data: existing });
        } catch (err) {
            console.error("KYC CORPORATE SUBMISSION ERROR", err);
            return res
                .status(500)
                .json({ success: false, message: "Server error submitting corporate KYC" });
        }
    },

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
