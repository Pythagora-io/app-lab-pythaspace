const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

function saveFile(file) {
  if (!file) return null;

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
  const filepath = path.join(uploadDir, filename);

  fs.writeFileSync(filepath, file.buffer, (err) => {
    if (err) {
      console.error('Error saving file:', err.message);
      console.error(err.stack);
      throw err;
    }
  });

  console.log(`File uploaded successfully: ${filename}`);

  return '/uploads/' + filename; // Return the path relative to public directory
}

module.exports = { saveFile, upload };