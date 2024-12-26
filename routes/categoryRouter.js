const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../middlewares/authMiddleware.js");
// Route for fetching all categories and creating a new one
router
  .route("/")
  .get(authenticateToken, isUser, categoryController.getAllCategories) // GET /api/categories
  .post(authenticateToken, isAdmin, categoryController.createCategory); // POST /api/categories

// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(authenticateToken, isUser, categoryController.getCategoryById) // GET /api/categories/:id
  .patch(authenticateToken, isAdmin, categoryController.updateCategory); // PATCH /api/categories/:id

// Route to deactivate a specific category
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, categoryController.deactivateCategory); // PATCH /api/categories/deActivate/:id

module.exports = router;
