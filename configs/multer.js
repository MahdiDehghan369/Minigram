const multer = require('multer');
const path = require('path');
const fs = require('fs');

const destinationPath = path.join(__dirname, "../public/uploads");

if(!fs.existsSync(destinationPath)){
    fs.mkdirSync(destinationPath)
}

const storage = multer.diskStorage({
    destination: (req, file , cb) => {
        cb(null, destinationPath);
    },
    filename: (req, file ,cb) => {
        const ext = path.extname(file.originalname)
        const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
        cb(null , uniqueName)
    }
})


const fileFilter = (req, file , cb) => {
      const imageTypes = ["image/jpeg", "image/png", "image/jpg"];
      const videoTypes = ["video/mp4", "video/mkv", "video/quicktime"];
      const allowed = [...imageTypes, ...videoTypes];

      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only images and videos are allowed"), false);
      }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});


module.exports = upload;