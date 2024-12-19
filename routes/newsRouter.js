const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
// Route for fetching all categories and creating a new one
router
  .route("/")
  .get(newsController.getAllNews) // GET /api/v1/categories
  .post(newsController.uploadFiles, newsController.createNews); // POST /api/v1/categories

// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(newsController.getNewsById) // GET /api/v1/categories/:id
  .patch(newsController.uploadFiles, newsController.updateNews); // PATCH /api/v1/categories/:id

// Route to deactivate a specific category
router.route("/deActivate/:id").patch(newsController.deactivateNews); // PATCH /api/v1/categories/deActivate/:id

module.exports = router;
