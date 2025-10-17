const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('images', 6), (req, res) => {
  // return filenames so frontend can attach them to donation
  const files = req.files.map(f => ({ filename: f.filename, path: f.path }));
  res.json(files);
});

module.exports = router;
