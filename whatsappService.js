const axios = require('axios');
require('dotenv').config({ path: './.env' });

const sendMessageWithRetry = async (phoneNumber, maxRetries = 3) => {
  const accessToken = process.env.ACCESS_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/v13.0/${phoneNumberId}/messages`;

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  const templateName = 'hello_world'; // Replace with your template name
  const languageCode = 'en_US'; // Replace with your language code

  const data = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode }
    }
  };

  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const response = await axios.post(url, data, { headers });
      console.log(`Message sent to ${phoneNumber}:`, response.data);
      return response.data;
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed for ${phoneNumber}:`, error.response ? error.response.data : error.message);
      if (attempts >= maxRetries) {
        console.error(`Max retries reached for ${phoneNumber}. Message not sent.`);
        throw error; // Optionally re-throw the error or handle it as needed
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Wait before retrying
    }
  }
};

const sendBulkMessages = async (phoneNumbers) => {
  for (const phoneNumber of phoneNumbers) {
    try {
      await sendMessageWithRetry(phoneNumber);
    } catch (error) {
      console.error(`Failed to send message to ${phoneNumber} after retries:`, error.message);
      // Log the error to a file or database for further analysis
    }
  }
};

module.exports = { sendBulkMessages };
