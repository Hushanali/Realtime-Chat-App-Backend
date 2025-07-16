const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { fileTypeValidator } = require("../utils/fileTypeValidator");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isFileTypeAllowed = fileTypeValidator(file);
    if (isFileTypeAllowed) {
      return cb(null, true);
    } else {
      cb(new Error("Uploaded file type is not allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).array("file", 1);

module.exports = upload;
