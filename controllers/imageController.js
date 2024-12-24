const News = require("../models/news");
const APIFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Image = require("../models/image");

//----------------------------------------------------------------
//----------------------------------------------------------------
//Image handeling
//----------------------------------------------------------------
//----------------------------------------------------------------

const allImages = async (req, res) => {
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
    const features = new APIFeatures(Image.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [imagesList, totalImagesCount] = await Promise.all([
      features.query, // Get paginated images results
      Image.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: imagesList.length, // Number of results in this response
      totalImagesCount, // Total count of matching documents
      data: imagesList, // The news data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Image

// Multer configuration
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const imageUploads = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
  },
});

const uploadImages = imageUploads.array("images", 10); // Allow up to 10 images

// Function to handle image uploads and save them to the database
const handleImages = async (req, res) => {
  try {
    const { newsId } = req.body; // Extract the newsId from the request body

    console.log(req.files[0].filename);
    if (!newsId) {
      return res.status(400).json({ error: "newsId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const imageRecords = [];

    // Loop through the uploaded files and save them to the database
    for (const file of req.files) {
      const imageSrc = `/images/${file.filename}`;
      const newImage = new Image({
        newsId,
        src: imageSrc,
      });

      const savedImage = await newImage.save();
      imageRecords.push(savedImage);
    }

    res.status(200).json({
      message: "Images uploaded and saved successfully!",
      images: imageRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
//delete images
const deleteImages = async (req, res) => {
  try {
    const { imageIds } = req.body; // Assuming you pass an array of image IDs to delete

    if (!imageIds || imageIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No image IDs provided for deletion" });
    }

    // Find images by their IDs
    const imagesToDelete = await Image.find({ _id: { $in: imageIds } });

    if (imagesToDelete.length === 0) {
      return res.status(404).json({ error: "No images found to delete" });
    }

    // Delete each image file from the file system
    for (const image of imagesToDelete) {
      const imagePath = path.join(__dirname, "..", image.src); // Path to the image file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Delete the image file from the server
      }
    }

    // Delete the images from the database
    await Image.deleteMany({ _id: { $in: imageIds } });

    res.status(200).json({
      message:
        "Images deleted successfully from both database and file system.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Update

// Controller function to update image data in the database

const updateImage = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the image to update

    // Find the existing image document in the database
    const existingImage = await Image.findById(id);

    if (!existingImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Determine the new image path (if any)
    const newImagePath = req.files[0]
      ? `/images/${req.files[0].filename}` // New image path
      : existingImage.src; // If no new image, keep the old one

    // If an old image exists and a new one is uploaded, delete the old one
    if (existingImage.src && req.files[0]) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public",
        existingImage.src
      ); // Absolute path to the old image
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete old image file
      }
    }

    // Update the image document in the database
    const updatedImage = await Image.findByIdAndUpdate(
      id,
      { src: newImagePath }, // Update the image path
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // Return a success response with the updated image
    res.status(200).json({
      message: "Image updated successfully",
      updatedImage,
    });
  } catch (error) {
    // Handle any errors during the update
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleImages,
  allImages,
  uploadImages,
  deleteImages,
  updateImage,
};
