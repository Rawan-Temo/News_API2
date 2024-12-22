const Category = require("../models/category");
const APIFeatures = require("../utils/apiFeatures");

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    // Convert the filtered query into a plain object for counting
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Parse the query string to convert query parameters like gte/gt/lte/lt into MongoDB operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Apply the parsed filter to count active documents
    const features = new APIFeatures(Category.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const [categories, numberOfActiveCategories] = await Promise.all([
      features.query, // Get paginated categories
      Category.countDocuments(parsedQuery), // Count all filtered documents
    ]);
    res.status(200).json({
      status: "success",
      results: categories.length, // Number of categories returned in the current query
      numberOfActiveCategories, // Total number of active categories matching filters
      data: categories, // The actual category data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res
      .status(201)
      .json({ message: "Category created successfully", newCategory });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category by ID
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deactivate a category by ID
const deactivateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, {
      active: false,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Category deactivated successfully",
      data: null, // No content for successful deactivation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deactivateCategory,
};
