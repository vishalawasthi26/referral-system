require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Fast2SMS API Key (Store this in .env file)
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

// Function to send SMS using Fast2SMS
async function sendSMS(phone, message) {
    try {
        const response = await axios.post("https://www.fast2sms.com/dev/bulkV2", 
            new URLSearchParams({
                route: "otp",
                numbers: phone,
                message: message,
                sender_id: "TXTIND"
            }).toString(),
            {
                headers: {
                    "authorization": FAST2SMS_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("SMS sending failed:", error.response ? error.response.data : error.message);
        throw new Error("Failed to send SMS");
    }
}

// API Endpoint to handle referral submissions
app.post("/send-sms", async (req, res) => {
    const { user, friends } = req.body;
    
    if (!user || !friends || friends.length !== 3) {
        return res.status(400).json({ error: "Invalid data submitted" });
    }

    try {
        // Generate a unique referral code
        let referralCode = "DRK" + Math.floor(100000 + Math.random() * 900000);

        // Send SMS to User
        await sendSMS(user.phone, `Hello ${user.name}, your referral code is: ${referralCode}`);

        // Send SMS to Friends
        for (let friend of friends) {
            await sendSMS(friend.phone, `Your friend referred you! Use this code: ${referralCode}`);
        }

        res.status(200).json({ message: "SMS sent successfully!", referralCode: referralCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
