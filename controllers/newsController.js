const News = require("../models/news");
const APIFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Get all news

const getAllNews = async (req, res) => {
  try {
    // Create a filtered query object for counting active news entries
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert operators like gte/gt/lte/lt into MongoDB equivalents
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter for querying and counting
    const features = new APIFeatures(
      News.find().populate("category"),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [newsList, totalNewsCount] = await Promise.all([
      features.query, // Get paginated news results
      News.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: newsList.length, // Number of results in this response
      totalNewsCount, // Total count of matching documents
      data: newsList, // The news data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new news entry

const createNews = async (req, res) => {
  try {
    // Extract the file paths from the request (assuming they are available in req.files)
    const photoPaths = req.files.photos
      ? req.files.photos.map((file) => `/images/${file.filename}`) // Use file.filename instead of file.path
      : [];
    const videoPath = req.files.video
      ? `/videos/${req.files.video[0].filename}`
      : null;

    // Create a new news entry, including file paths
    const newNews = await News.create({
      ...req.body,
      photos: photoPaths, // Array of photo file paths
      video: videoPath, // Single video file path
    });

    // Send a response indicating success
    res.status(201).json({
      message: "News created successfully",
      newNews,
    });
  } catch (error) {
    // Handle any errors that occur during creation
    res.status(400).json({ message: error.message });
  }
};

// Get a specific news entry by ID

const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json(news);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a specific news entry by ID

const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const existingNews = await News.findById(id);
    const photoPaths = req.files.photos
      ? req.files.photos.map((file) => `/images/${file.filename}`) // Use file.filename instead of file.path
      : [];



      
    const videoPath = req.files.video
      ? `/videos/${req.files.video[0].filename}`
      : existingNews.video;

    if (existingNews.video && req.files.video) {
      const oldVideoPath = path.join(
        __dirname,
        "../public",
        existingNews.video
      ); // Absolute path to the old video
      console.log(oldVideoPath);
      if (fs.existsSync(oldVideoPath)) {
        fs.unlinkSync(oldVideoPath); // Delete old video file
      }
    }
    req.body.video = videoPath;

    const updatedNews = await News.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the update
    });
    // Send the success response with the updated news data
    res.status(200).json({
      message: "News updated successfully",
      updatedNews,
    });
  } catch (error) {
    // Handle any errors during the update
    res.status(400).json({ message: error.message });
  }
};

// Deactivate a news entry (soft delete)
const deactivateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({
      status: "success",
      message: "News deactivated successfully",
      data: news,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Configure Multer storage
// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photos") {
      cb(null, "public/images"); // Directory for images
    } else if (file.fieldname === "video") {
      cb(null, "public/videos"); // Directory for videos
    } else {
      cb(null, "uploads");
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`; // Ensure uniqueness
    cb(null, fileName); // Set the file name as a combination of timestamp and random number
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "photos") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for photos!"), false);
    }
  } else if (file.fieldname === "video") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  } else {
    cb(new Error("Unsupported file type!"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 40 * 1024 * 1024, // 40MB max for images and videos
  },
});

// Middleware for handling file uploads
const uploadFiles = upload.fields([
  { name: "photos", maxCount: 3 }, // Allow up to 3 photos
  { name: "video", maxCount: 1 }, // Allow 1 video
]);
module.exports = {
  getAllNews,
  createNews,
  uploadFiles,
  getNewsById,
  updateNews,
  deactivateNews,
};
