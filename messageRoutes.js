const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../controllers/messageController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;
