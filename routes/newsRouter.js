const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const imageController = require("../controllers/imageController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../middlewares/authMiddleware.js");
// SEARCH
router.route("/search").get(authenticateToken, isUser, newsController.search);

//Media
router
  .route("/images")
  .get(authenticateToken, isUser, imageController.allImages);
router
  .route("/images")
  .delete(authenticateToken, isAdmin, imageController.deleteImages);
router
  .route("/images/:id")
  .patch(
    authenticateToken,
    isAdmin,
    imageController.uploadImages,
    imageController.updateImage
  );
router
  .route("/handleMedia")
  .post(
    authenticateToken,
    isAdmin,
    imageController.uploadImages,
    imageController.handleImages
  ); // POST /api/handleMedia
//Media

// Route for fetching all categories and creating a new one
router
  .route("/")
  .get(authenticateToken, isUser, newsController.getAllNews) // GET /api/categories
  .post(
    authenticateToken,
    isAdmin,
    newsController.uploadVideo,
    newsController.createNews
  ); // POST /api/categories
// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(authenticateToken, isUser, newsController.getNewsById) // GET /api/categories/:id
  .patch(
    authenticateToken,
    isAdmin,
    newsController.uploadVideo,
    newsController.updateNews
  ); // PATCH /api/categories/:id

// Route to deactivate a specific category
router
  .route("/deActivate/:id")
  .patch(authenticateToken, isAdmin, newsController.deactivateNews); // PATCH /api/categories/deActivate/:id

module.exports = router;
