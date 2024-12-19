const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Route for fetching all categories and creating a new one
router
  .route("/")
  .get(categoryController.getAllCategories) // GET /api/v1/categories
  .post(categoryController.createCategory); // POST /api/v1/categories

// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(categoryController.getCategoryById) // GET /api/v1/categories/:id
  .patch(categoryController.updateCategory); // PATCH /api/v1/categories/:id

// Route to deactivate a specific category
router.route("/deActivate/:id").patch(categoryController.deactivateCategory); // PATCH /api/v1/categories/deActivate/:id

module.exports = router;
