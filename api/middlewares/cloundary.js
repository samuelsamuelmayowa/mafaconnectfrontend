const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary (same as your product upload)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine — KYC folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "mafaconnect/kyc",
      resource_type: "auto",
      public_id: `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
