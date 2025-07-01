const express = require('express');
const router = express.Router();
const { verifyWebhook, handleWebhook } = require('../controllers/messageController');

router.get('/', verifyWebhook);
router.post('/', handleWebhook);

module.exports = router;
