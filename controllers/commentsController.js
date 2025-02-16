const Comment = require("../models/comment");
const APIFeatures = require("../utils/apiFeatures");

// Get all comments
const getAllComments = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert operators like gte/gt/lte/lt into MongoDB equivalents
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter for querying and counting
    const features = new APIFeatures(
      Comment.find().populate("userId"),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [comments, totalCommentsCount] = await Promise.all([
      features.query, // Get paginated comments results
      Comment.countDocuments(parsedQuery), // Count total matching documents
    ]);

    res.status(200).json({
      status: "success",
      results: comments.length,
      totalCommentsCount, // Total count of matching documents
      data: comments,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a new comment
const addComment = async (req, res) => {
  try {
    const userId = req.user._id; // Get the user ID from req.user
    const newComment = await Comment.create({ ...req.body, userId }); // Include userId in the new comment
    res.status(201).json({
      status: "success",
      data: newComment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a comment by ID
const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user._id;
    if (userId.toString() !== comment.userId.toString()) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedComment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    const userId = req.user._id;
    if (userId.toString() !== comment.userId.toString()) {
      return res.status(403).json({ message: "You are not authorized" });
    }
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllComments,
  addComment,
  getCommentById,
  updateComment,
  deleteComment,
};
