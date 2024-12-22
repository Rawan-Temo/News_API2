const User = require("../models/user"); // Assuming the User model is in 'models/user.js'
const bcrypt = require("bcrypt"); // For password hashing and validation
const jwt = require("jsonwebtoken"); // For creating JWT tokens
const UserVerification = require("../models/userVerification");
const nodemailer = require("nodemailer");
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
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please Verify Your Email " });
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
        expiresIn: "10h",
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

//sign Up0
const signUp = async (req, res) => {
  try {
    const { username, email, password, phone, role } = req.body;

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database with the hashed password
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    // Generate a six-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Save verification details
    await UserVerification.create({
      userId: user._id,
      verificationCode,
    });

    res.status(201).json({
      message: "User created successfully. Please verify your email.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Sign-up failed", error: err.message });
  }
};
//CODE GENERATING
const userVerification = async (req, res) => {
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

    const users = await UserVerification.find(parsedQuery)
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || "createdAt"); // You can sort by any field, default by creation date

    const totalUsersCount = await UserVerification.countDocuments(parsedQuery);

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

const sendEmail = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Fetch the user's verification details
    const verificationRecord = await UserVerification.findOne({
      userId,
    }).populate("userId");
    if (!verificationRecord) {
      return res
        .status(404)
        .json({ message: "Verification record not found." });
    }

    if (verificationRecord.active) {
      return res.status(400).json({ message: "User is already verified." });
    }

    const { verificationCode } = verificationRecord;

    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Replace with your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Fetch user's email from the database or include it in `UserVerification` schema
    const userEmail = verificationRecord.userId.email; // Assuming email is stored in the `UserVerification` schema

    if (!userEmail) {
      return res
        .status(400)
        .json({ message: "Email is missing in verification record." });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your Verification Code",
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
              color: #333;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 10px 0;
              border-bottom: 1px solid #ddd;
            }
            .header h1 {
              color: #007bff;
              font-size: 24px;
            }
            .content {
              padding: 20px;
              line-height: 1.6;
            }
            .content p {
              margin: 0 0 10px;
            }
            .code {
              display: inline-block;
              font-size: 18px;
              font-weight: bold;
              color: #007bff;
              background: #f9f9f9;
              padding: 10px 20px;
              border-radius: 4px;
              margin: 10px 0;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Verification Code</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your verification code is:</p>
              <div class="code">${verificationCode}</div>
              <p>If you did not request this, please ignore this email.</p>
              <p>Thank you!</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Verification email sent successfully." });
  } catch (err) {
    console.error("Error sending verification email:", err);
    res.status(500).json({
      message: "Failed to send verification email.",
      error: err.message,
    });
  }
};
//Verify

const verify = async (req, res) => {
  const { verificationCode } = req.body;

  // Validate input
  if (!verificationCode) {
    return res.status(400).json({ message: " verification code is required." });
  }

  try {
    // Find the verification record
    const verificationRecord = await UserVerification.findOne({
      verificationCode,
    });

    // Check if the record exists
    if (!verificationRecord) {
      return res.status(404).json({ message: "Invalid verification code" });
    }

    // Check if the user is already verified
    if (verificationRecord.active) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Mark as verified
    verificationRecord.active = true;
    await verificationRecord.save();
    const verifyUser = await User.findById(verificationRecord.userId);
    verifyUser.isVerified = true;
    await verifyUser.save();

    res.status(200).json({ message: "User successfully verified." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({
      message: "An error occurred during verification.",
      error: err.message,
    });
  }
};

module.exports = {
  login,
  createUser,
  getAllUsers,
  getAUser,
  deleteAUser,
  signUp,
  userVerification,
  sendEmail,
  verify,
};
