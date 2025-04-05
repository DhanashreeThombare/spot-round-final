const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Admin model
const secretKey = "your_secret_key"; // Store securely in env file
 

// Admin Signup (Only once)
router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) {
            return res.status(400).json({ message: "Signup allowed only once." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ username, password: hashedPassword });
        await admin.save();

        res.status(201).json({ message: "Admin registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin._id }, secretKey, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
