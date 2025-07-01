const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { sendBulkMessages } = require('../services/whatsappService');

const verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("✅ Webhook verified successfully!");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

const handleWebhook = (req, res) => {
    const data = req.body;
    console.log("💬 Webhook received:", JSON.stringify(data, null, 2));

    if (data.entry) {
        data.entry.forEach(entry => {
           // const entry = req.body.entry;
            const statusObject = entry.changes[0].value.statuses[0];
            const status = statusObject.status;
            const timestamp = statusObject.timestamp;
            const recipientId = statusObject.recipient_id;
            console.log("Status:", statusObject);

            console.log("Status:", status);
            console.log("Timestamp:", timestamp);
            console.log("Recipient ID:", recipientId);

            if (entry.changes) {
                entry.changes.forEach(change => {
                    if (change.value.messages) {
                        change.value.messages.forEach(message => {
                            console.log('Message status update:', message);
                            // Handle different message statuses
                            if (message.status === 'delivered') {
                                console.log(`Message delivered to ${message.to}`);
                            } else if (message.status === 'failed') {
                                console.error(`Message failed to ${message.to}:`, message.errors);
                            }
                            // Add more status checks as needed
                        });
                    }
                });
            }
        });
    }

    res.sendStatus(200);
};

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const phoneNumbers = [];

    if (req.file.mimetype === 'text/csv') {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                const phoneNumber = data.phoneNumber; // Ensure your CSV has a 'phoneNumber' column
                if (phoneNumber) phoneNumbers.push(phoneNumber);
            })
            .on('end', async () => {
                console.log('CSV file successfully processed');
                await sendBulkMessages(phoneNumbers);
                res.json({ message: 'File uploaded and processed', data: phoneNumbers });
            });
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1); // First sheet
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber !== 1) { // Skip header row
                    const phoneNumber = row.getCell(1).value; // Assuming phone numbers are in the first column
                    if (phoneNumber) phoneNumbers.push(phoneNumber);
                }
            });
            await sendBulkMessages(phoneNumbers);
            res.json({ message: 'File uploaded and processed', data: phoneNumbers });
        } catch (error) {
            console.error('Error processing Excel file:', error);
            res.status(500).send('Error processing Excel file');
        }
    } else {
        res.status(400).send('Unsupported file type.');
    }
};

module.exports = { verifyWebhook, handleWebhook, uploadFile };
