const APIFeatures = require("../utils/apiFeatures");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/media"); // Changed from Image to Media

//----------------------------------------------------------------
//----------------------------------------------------------------
//Media handling
//----------------------------------------------------------------
//----------------------------------------------------------------

const allMedia = async (req, res) => {
  // Changed from allImages to allMedia
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
    const features = new APIFeatures(Media.find(), req.query) // Changed from Image to Media
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [mediaList, totalMediaCount] = await Promise.all([
      features.query, // Get paginated media results
      Media.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: mediaList.length, // Number of results in this response
      totalMediaCount, // Total count of matching documents
      data: mediaList, // The media data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Media

// Multer configurationconst
mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/media"); // Directory to save uploaded media
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter to allow only images, PDFs, and Word documents
const mediaFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDF, and Word documents are allowed!"), false);
  }
};

const mediaUploads = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

const uploadMedia = mediaUploads.array("media", 10); // Allows multiple files (max 10)

// Function to handle media uploads and save them to the database
const handleMedia = async (req, res) => {
  // Changed from handleImages to handleMedia
  try {
    const { newsId } = req.body; // Extract the newsId from the request body

    console.log(req.files[0].filename);
    if (!newsId) {
      return res.status(400).json({ error: "newsId is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No media uploaded" });
    }

    const mediaRecords = []; // Changed from imageRecords to mediaRecords

    // Loop through the uploaded files and save them to the database
    for (const file of req.files) {
      const mediaSrc = `/media/${file.filename}`; // Changed from imageSrc to mediaSrc
      const newMedia = new Media({
        // Changed from newImage to newMedia
        newsId,
        src: mediaSrc,
      });

      const savedMedia = await newMedia.save(); // Changed from savedImage to savedMedia
      mediaRecords.push(savedMedia); // Changed from imageRecords to mediaRecords
    }

    res.status(200).json({
      message: "Media uploaded and saved successfully!", // Changed from "Images" to "Media"
      media: mediaRecords, // Changed from images to media
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
//delete media
const deleteMedia = async (req, res) => {
  // Changed from deleteImages to deleteMedia
  try {
    const { mediaIds } = req.body; // Changed from imageIds to mediaIds

    if (!mediaIds || mediaIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No media IDs provided for deletion" }); // Changed from "image IDs" to "media IDs"
    }

    // Find media by their IDs
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } }); // Changed from imagesToDelete to mediaToDelete

    if (mediaToDelete.length === 0) {
      return res.status(404).json({ error: "No media found to delete" }); // Changed from "images" to "media"
    }

    // Delete each media file from the file system
    for (const media of mediaToDelete) {
      // Changed from image to media
      const mediaPath = path.join(__dirname, "..", media.src); // Changed from imagePath to mediaPath
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath); // Delete the media file from the server
      }
    }

    // Delete the media from the database
    await Media.deleteMany({ _id: { $in: mediaIds } }); // Changed from Image to Media

    res.status(200).json({
      message: "Media deleted successfully from both database and file system.", // Changed from "Images" to "Media"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
// Update

// Controller function to update media data in the database

const updateMedia = async (req, res) => {
  // Changed from updateImage to updateMedia
  try {
    const { id } = req.params; // The ID of the media to update

    // Find the existing media document in the database
    const existingMedia = await Media.findById(id); // Changed from existingImage to existingMedia

    if (!existingMedia) {
      return res.status(404).json({ error: "Media not found" }); // Changed from "Image" to "Media"
    }

    // Determine the new media path (if any)
    const newMediaPath = req.files[0]
      ? `/media/${req.files[0].filename}` // Changed from image to media
      : existingMedia.src; // If no new media, keep the old one

    // If an old media exists and a new one is uploaded, delete the old one
    if (existingMedia.src && req.files[0]) {
      const oldMediaPath = path.join(
        __dirname,
        "..",
        "public",
        existingMedia.src
      ); // Changed from oldImagePath to oldMediaPath
      if (fs.existsSync(oldMediaPath)) {
        fs.unlinkSync(oldMediaPath); // Delete old media file
      }
    }

    // Update the media document in the database
    const updatedMedia = await Media.findByIdAndUpdate(
      // Changed from updatedImage to updatedMedia
      id,
      { src: newMediaPath }, // Changed from newImagePath to newMediaPath
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // Return a success response with the updated media
    res.status(200).json({
      message: "Media updated successfully", // Changed from "Image" to "Media"
      updatedMedia, // Changed from updatedImage to updatedMedia
    });
  } catch (error) {
    // Handle any errors during the update
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  handleMedia, // Changed from handleImages to handleMedia
  allMedia, // Changed from allImages to allMedia
  uploadMedia, // Changed from uploadImages to uploadMedia
  deleteMedia, // Changed from deleteImages to deleteMedia
  updateMedia, // Changed from updateImage to updateMedia
};
