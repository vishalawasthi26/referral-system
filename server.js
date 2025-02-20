require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

async function sendSMS(number, message) {
    try {
        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "v3",
                sender_id: "TXTIND",
                message: message,
                language: "english",
                numbers: number,
            },
            {
                headers: {
                    "authorization": FAST2SMS_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending SMS:", error);
        return null;
    }
}

app.post("/send-sms", async (req, res) => {
    const { user, friends } = req.body;

    try {
        // Send SMS to User
        await sendSMS(user.phone, `Hello ${user.name}, your referral code is: ${user.code}`);

        // Send SMS to Friends
        for (let friend of friends) {
            await sendSMS(friend.phone, `Your friend referred you! Use this code: ${friend.code}`);
        }

        res.status(200).json({ message: "SMS sent successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
