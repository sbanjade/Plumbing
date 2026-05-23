require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, "..", "data");
const requestsFile = path.join(dataDir, "requests.json");
const clientNotificationPhone = process.env.CLIENT_NOTIFICATION_PHONE || "330-701-0611";
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromPhone = process.env.TWILIO_FROM_PHONE;
const smsEnabled = Boolean(twilioAccountSid && twilioAuthToken && twilioFromPhone);
const twilioClient = smsEnabled ? twilio(twilioAccountSid, twilioAuthToken) : null;

function ensureRequestsFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, "[]", "utf8");
  }
}

function readRequests() {
  ensureRequestsFile();

  try {
    const raw = fs.readFileSync(requestsFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeRequests(requests) {
  ensureRequestsFile();
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2), "utf8");
}

async function sendClientText(entry) {
  if (!smsEnabled) {
    return {
      sent: false,
      reason: "SMS is not configured yet."
    };
  }

  const body =
    `New plumbing request from ${entry.name}.\n` +
    `Phone: ${entry.phone}\n` +
    `Service: ${entry.service}\n` +
    `Message: ${entry.message}\n` +
    `Submitted: ${entry.receivedAt}`;

  try {
    const message = await twilioClient.messages.create({
      body,
      to: clientNotificationPhone,
      from: twilioFromPhone
    });

    return {
      sent: true,
      sid: message.sid
    };
  } catch (error) {
    console.error("Twilio SMS failed:", error.message);
    return {
      sent: false,
      reason: error.message
    };
  }
}

ensureRequestsFile();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    business: "PlumberAter Plumbing",
    phone: "330-701-0611"
  });
});

app.get("/api/requests", (req, res) => {
  const requests = readRequests();
  res.json(requests);
});

app.post("/api/contact", async (req, res) => {
  const { name, phone, service, message } = req.body;

  if (!name || !phone || !service || !message) {
    return res.status(400).json({
      message: "Please fill out all form fields before sending your request."
    });
  }

  const requests = readRequests();
  const entry = {
    id: requests.length + 1,
    name,
    phone,
    service,
    message,
    receivedAt: new Date().toISOString()
  };

  requests.push(entry);
  writeRequests(requests);
  const smsResult = await sendClientText(entry);

  return res.json({
    message: "Thanks! Your plumbing request was received. Call 330-701-0611 for immediate help.",
    smsNotificationSent: smsResult.sent
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(PORT, () => {
  if (!smsEnabled) {
    console.log("SMS notifications are off. Add Twilio credentials to enable text alerts.");
  }

  console.log(`PlumberAter Plumbing site running on http://localhost:${PORT}`);
});
