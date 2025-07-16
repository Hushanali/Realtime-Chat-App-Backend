const path = require("path");

const fileTypeValidator = (file) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|webm|pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  return extname && mimeType;
};

module.exports = { fileTypeValidator };
