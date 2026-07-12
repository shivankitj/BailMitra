const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get("/", [auth, roleCheck(["admin"])], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, profileImage } = req.body;

    // Build user object
    const userFields = {};
    if (firstName) userFields.firstName = firstName;
    if (lastName) userFields.lastName = lastName;
    if (phone) userFields.phone = phone;
    if (address) userFields.address = address;
    if (profileImage) userFields.profileImage = profileImage;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   GET api/users/lawyers
// @desc    Get all lawyers
// @access  Private
router.get("/role/lawyers", auth, async (req, res) => {
  try {
    const lawyers = await User.find({ role: "lawyer" }).select("-password");
    res.json(lawyers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/users/judges
// @desc    Get all judges
// @access  Private
router.get("/role/judges", auth, async (req, res) => {
  try {
    const judges = await User.find({ role: "judge" }).select("-password");
    res.json(judges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;