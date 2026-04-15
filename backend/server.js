require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// Basic Route to Test Server
app.get('/', (req, res) => {
    res.json({ message: "DriveSafe API is running!" });
});

// Example Route: Get All Instructors
app.get('/api/instructors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM instructors');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
