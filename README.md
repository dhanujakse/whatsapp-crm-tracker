# whatsapp-crm-tracker
WhatsApp Cloud API Bulk Sender with Express.js:
This will allows you to send WhatsApp messages in bulk using the WhatsApp Cloud API (via Meta Facebook Developers), with CSV or Excel upload support, webhook handling to deliver and fetch message statuses with some basic details for futhur integration into the database for website display.

Overview:
* Allows you to upload a CSV or Excel file containing phone numbers.
* Sends bulk WhatsApp template messages to those numbers using WhatsApp Cloud API.
* Uses a webhook to fetch delivery status updates (e.g., delivered, read, failed).
* Can fetch phone number,status,time of the message sent for storage(database) purpose for futhur displaying of details in website.

Prerequisites:
* Node.js (v14+ recommended)
* npm
* Facebook (Meta) Developer account
* WhatsApp Cloud API setup
* Ngrok (for local webhook testing)

**Step 1:**
Setup Facebook (Meta) Developer Account:

1. Go to [developers.facebook.com](https://developers.facebook.com/).

2️. Sign up for a developer account and verify your email.

3️. Accept the required developer terms and policies.

Create WhatsApp Cloud API App:

1️. Click My Apps → Create App.

2️. Choose "Business" as app type.

3️. Fill in your app name and email, and click Create App.

4️. Add "WhatsApp" product to your app.

5️. Create a WhatsApp Business Account if prompted.

**Step 2:**
Generate Access Tokens:

For Temporary Token:

* Go to WhatsApp section in your app dashboard.
* Copy the Temporary Access Token shown there (valid for 23 hours).

For Permanent Token (Long-lived) - valid for 60 days:
Steps:
1. Navigate to Business Settings
   * On the top right, click My Apps → Business Settings.
   * In Business Settings, on the left side, go to Users → System Users.

2. Create a System User
   * If you don’t have one, click Add to create a System User.
   * Choose a name (example: My WhatsApp Bot User).
   * Choose Admin as role.

3. Generate a system user access token
    * Click your system user name.
    * Under System User, go to Add Assets → Choose your App.
    * Then click Generate New Token.

4. Select permissions
    * While generating token:
    * Select your app.
    * Choose required permissions:
    --> whatsapp_business_messaging
    --> whatsapp_business_management
    --> business_management (optional, but recommended).

5. Generate the token
     * After selecting permissions, click Generate Token.
     * Copy the token shown.
       
Important: Copy it and store it safely. You won't see it again.

Whatever token you generated it may b either temporary or permanent,add it in a file named '.env' like this:
ACCESS_TOKEN=your_temporary_or_permanent_token_here
PHONE_NUMBER_ID=your_whatsapp_phone_number_id
VERIFY_TOKEN=your_verify_token_for_webhook(for this refer step 6 and update)

**Step 3:**
To Setup the app run the following commands in your terminal:
  * git clone your-repo-url
  * cd your-repo-folder
  * npm install

**Step 4:**
To run the app,
   * node index.js
 
**Step 5:**
To check and Upload CSV/Excel File:
   * After running the command in step 4,u will see something like this http://localhost:3000 
   * Upload a CSV or Excel file containing phone numbers (one per row).(using curl/postman)
   * The backend reads and extracts numbers, then sends WhatsApp messages to each.

**Step 6:**
Webhook Setup & Message Status Tracking:
We need a webhook url to paste it in meta developers account.Steps are mentioned below:
Get webhook URL using ngrok,
Step-by-step:

1️. Install ngrok
  * If not already installed:
      npm install -g ngrok
  * Or download from [https://ngrok.com/download](https://ngrok.com/download).
2. Start your Express server locally
  * For example:
     node index.js
when we run the above command in our terminal,it show something like this,
"http://localhost:3000"

3. Start ngrok
   * Open another terminal and run this too:
       ngrok http 3000
       Here, `3000` is the port your Express server runs on.

4. Copy your ngrok URL
   * After running the above command, ngrok will show an output like this:
       Forwarding    https://473d-2406-7400-ca-d5e8-f504-87b1-174f-203f.ngrok-free.app -> http://localhost:3000
       So,Your public ngrok URL is:
       https://473d-2406-7400-ca-d5e8-f504-87b1-174f-203f.ngrok-free.app
   
5. Add webhook path
   * In your app, your webhook endpoint is for example `/webhook`.
   * So, your full webhook URL is:
        https://473d-2406-7400-ca-d5e8-f504-87b1-174f-203f.ngrok-free.app/webhook - Paste this url in place of callback url
6. Update in Meta developer console
    * Go to Meta Developers → WhatsApp → Configuration → Webhooks**.
    * Paste the full ngrok URL with '/webhook' as your webhook URL.
    * Add your verify token (the one you put in '.env').

7. Save and verify
   * Meta will send a verification request to your URL (like `GET /webhook`).
   If you paste the code correctly, it will reply with **"Webhook verified successfully!"** in your terminal.

Important points to note:
   * Your ngrok URL changes every time you restart ngrok (if you use free plan).
       → So, each time you restart, update the new URL in Meta developer console.
   * Keep your ngrok terminal window open as long as you are testing.
   * While getting a domainwe can have our permanent url / we can also use ngrok paid permanent url for reserved domain.

**Step 7:**
Fetch status data:
    * Our code automatically logs `status`, `recipient_id`, and `timestamp` from webhook events.
    * Example extracted fields:
    --> 'status': delivered, sent, failed, etc.
    --> 'recipient_id': receiver's WhatsApp ID
    --> 'timestamp': time of update
    
Testing with Postman

   * **Webhook testing**: Send a mock JSON POST request to your '/webhook' endpoint and observe logs or DB inserts.
   * **Upload testing**: Send a `multipart/form-data` POST request to '/messages/upload' with your CSV/Excel file.

---> Error Handling
    * Implemented retries while sending messages (3 attempts).
    * Logs errors clearly if any message fails.
    * Handles unsupported file types (only CSV & XLSX allowed).


