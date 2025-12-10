const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
// Temporary storage before Cloudinary upload
// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const unique = uuidv4(); // guaranteed unique ID
    cb(null, unique + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"), false);
  }
}


const upload = multer({ storage, fileFilter });

module.exports = upload;

// const multer = require("multer");
// const path = require("path");

// // Temporary storage before Cloudinary upload
// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// function fileFilter(req, file, cb) {
//   const allowed = ["image/jpeg", "image/png", "image/webp","pdf",".pdf","doc",".doc"];
//   if (allowed.includes(file.mimetype)) cb(null, true);
//   else cb(new Error("Only images are allowed"), false);
// }

// const upload = multer({ storage, fileFilter });

// module.exports = upload;
