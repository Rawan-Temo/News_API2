const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const imageController = require("../controllers/imageController");
// SEARCH
router.route("/search").get(newsController.search);

//Media
router.route("/images").get(imageController.allImages);
router.route("/images").delete(imageController.deleteImages);
router.route("/images/:id").patch(imageController.uploadImages,imageController.updateImage);
router
.route("/handleMedia")
.post(imageController.uploadImages, imageController.handleImages);  // POST /api/handleMedia
//Media

// Route for fetching all categories and creating a new one
router
  .route("/")
  .get(newsController.getAllNews) // GET /api/categories
  .post(newsController.uploadVideo, newsController.createNews); // POST /api/categories
// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(newsController.getNewsById) // GET /api/categories/:id
  .patch(newsController.uploadVideo, newsController.updateNews); // PATCH /api/categories/:id

// Route to deactivate a specific category
router.route("/deActivate/:id").patch(newsController.deactivateNews); // PATCH /api/categories/deActivate/:id

module.exports = router;
