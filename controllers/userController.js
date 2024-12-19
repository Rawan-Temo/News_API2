const User = require("../models/user"); // Assuming the User model is in 'models/user.js'
const bcrypt = require("bcrypt"); // For password hashing and validation
const jwt = require("jsonwebtoken"); // For creating JWT tokens

// Controller for user login
const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    let user;
    // If email is provided, find by email
    if (email) {
      user = await User.findOne({ email });
    }
    // If username is provided, find by username
    else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }

    // Compare the entered password with the stored password (hashed)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid username/email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for creating a new user
const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    await newUser.save();
    res.status(201).json({
      message: "User created successfully!",
      newUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller for getting all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    // Extracting query parameters from the request
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Building the query with the filter
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Pagination, sorting, and limiting fields
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(parsedQuery)
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "createdAt"); // You can sort by any field, default by creation date

    const totalUsersCount = await User.countDocuments(parsedQuery);

    res.status(200).json({
      status: "success",
      results: users.length,
      totalUsersCount, // Total count of users matching query
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for getting a single user by ID
const getAUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for deleting a user
const deleteAUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  createUser,
  getAllUsers,
  getAUser,
  deleteAUser,
};
