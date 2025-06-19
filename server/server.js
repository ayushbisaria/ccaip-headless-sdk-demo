require('dotenv').config({ path: './config/.env' });
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

// Get companySecret from environment variables
const companySecret = process.env.COMPANY_SECRET;
const host = process.env.HOST;
const companyId = process.env.COMPANY_ID;
const menuId = process.env.MENU_ID; // This will be a string
const tenant = process.env.TENANT;

// Ensure companySecret is loaded
if (!companySecret) {
    console.error("Error: COMPANY_SECRET is not defined in the environment or .env file.");
    process.exit(1); // Exit if the secret is not found
}
if (!host || !companyId || !menuId || !tenant) {
    console.error("Error: One or more Ujet configuration variables (HOST, COMPANY_ID, MENU_ID, TENANT) are missing in the environment or .env file.");
    process.exit(1);
}
// --- THIS IS THE ROBUST CORS FIX ---
// Define a list of allowed origins. This allows both localhost and 127.0.0.1
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
// --- END OF FIX ---


// Create an endpoint to generate the JWT
app.get('/api/get-chat-token', (req, res) => {
    try {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = now + (24 * 60 * 60); // 24 hours

        const payload = {
            nbf: now,
            iat: now,
            exp: expiresIn,
            identifier: "67d8558d1371b8e8e"
        };

        const token = jwt.sign(payload, companySecret, { algorithm: 'HS256' });
        //console.log(token)
        res.json({ token });

    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// NEW: Endpoint to provide Ujet configuration to the client
app.get('/api/ccaas-config', (req, res) => {
    res.json({
        host: host,
        companyId: companyId,
        menuId: parseInt(menuId, 10), // Convert menuId to a number
        tenant: tenant
    });
});


app.listen(port, () => {
  console.log(`Authentication server listening at http://localhost:${port}`);
});
