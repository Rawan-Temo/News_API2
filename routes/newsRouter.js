const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
// SEARCH
router.route("/search").get(newsController.search);

// Route for fetching all categories and creating a new one
router
  .route("/")
  .get(newsController.getAllNews) // GET /api/categories
  .post(newsController.uploadFiles, newsController.createNews); // POST /api/categories

// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(newsController.getNewsById) // GET /api/categories/:id
  .patch(newsController.uploadFiles, newsController.updateNews); // PATCH /api/categories/:id

// Route to deactivate a specific category
router.route("/deActivate/:id").patch(newsController.deactivateNews); // PATCH /api/categories/deActivate/:id

module.exports = router;
