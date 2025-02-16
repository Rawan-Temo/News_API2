const News = require("../models/news");
const APIFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/media");
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
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
    const newsWithMedia = await Promise.all(
      newsList.map(async (newsItem) => {
        console.log(newsItem._id);
        const media = await Media.find({ newsId: newsItem._id });
        console.log(media);
        return {
          ...newsItem.toObject(),
          media: media.map((media) => media.src), // Include only the src field for simplicity
        };
      })
    );
    res.status(200).json({
      status: "success",
      results: newsWithMedia.length, // Number of results in this response
      totalNewsCount, // Total count of matching documents
      data: newsWithMedia, // The news data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
// Create a new news entry

const createNews = async (req, res) => {
  try {
    // Extract the file paths from the request (assuming they are available in req.files)
    const videoPath = req.file ? `/videos/${req.file.filename}` : null;

    // Create a new news entry, including file paths
    const newNews = await News.create({
      ...req.body,
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

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
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

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
// Update a specific news entry by ID

const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const existingNews = await News.findById(id);
    const videoPath = req.file
      ? `/videos/${req.file.filename}`
      : existingNews.video;

    if (existingNews.video && req.file) {
      const oldVideoPath = path.join(
        __dirname,
        "../public",
        existingNews.video
      ); // Absolute path to the old video
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

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
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

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
// File filter for validation
const fileFilter = (req, file, cb) => {
  // Check if the field name matches "video"
  if (file.fieldname === "video") {
    // Check if the mimetype starts with "video/"
    if (file.mimetype.startsWith("video/")) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Only video files are allowed!"), false); // Reject non-video files
    }
  } else {
    cb(new Error("Unsupported file field!"), false); // Reject other field names
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the upload directory
    cb(null, "public/videos");
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Multer upload instance
const upload = multer({
  storage, // Use the defined storage configuration
  fileFilter, // Use the custom file filter
  limits: {
    fileSize: 40 * 1024 * 1024, // Limit file size to 40MB
  },
});

// Middleware for handling video uploads
const uploadVideo = (req, res, next) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      // Handle upload errors
      return res.status(400).json({ message: err.message });
    }
    next(); // Proceed to the next middleware
  });
};

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
// SEARCH HANDLER
const search = async (req, res) => {
  try {
    const query = req.body.search; // The search term from the client

    // Ensure the search query is provided
    if (!query) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }

    // Perform fuzzy search using mongoose-fuzzy-searching plugin
    const features = new APIFeatures(News.fuzzySearch(query), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const featurersCount = new APIFeatures(
      News.fuzzySearch(query),
      req.query
    ).filter();

    let [results, numberOfActiveNews] = await Promise.all([
      features.query,
      featurersCount.query.countDocuments(),
    ]);

    return res.status(200).json({
      status: "success",
      numberOfActiveNews, // Total number of results found
      data: results, // The matching documents
    });
  } catch (err) {
    console.error("Error during search:", err); // Log error for debugging
    return res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong during the search",
    });
  }
};

//----------------------------------------------------------------
//----------------------------------------------------------------

module.exports = {
  getAllNews,
  createNews,
  uploadVideo,
  getNewsById,
  updateNews,
  deactivateNews,
  search,
};
