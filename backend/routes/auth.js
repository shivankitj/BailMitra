const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      barCouncilNumber,
      courtId,
      phone,
      address,
    } = req.body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({ msg: "Please provide valid field types" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    // Validate role-specific fields
    if (role === "lawyer" && !barCouncilNumber) {
      return res
        .status(400)
        .json({ msg: "Bar Council Number is required for advocates" });
    }

    if (role === "judge" && !courtId) {
      return res.status(400).json({ msg: "Court ID is required for judges" });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      role,
      barCouncilNumber,
      courtId,
      phone,
      address,
    });

    // Password will be hashed by the User model's pre-save hook
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            barCouncilNumber: user.barCouncilNumber,
            courtId: user.courtId,
          },
        });
      }
    );
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            barCouncilNumber: user.barCouncilNumber,
            courtId: user.courtId,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/auth/verify-token
// @desc    Verify token validity
// @access  Public
router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ valid: false, msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Check if user still exists
    const user = await User.findById(decoded.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ valid: false, msg: "User not found" });
    }

    return res.json({ valid: true, user });
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ valid: false, msg: "Invalid token" });
  }
});

module.exports = router;