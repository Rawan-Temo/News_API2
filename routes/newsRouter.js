const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const mediaController = require("../controllers/imageController"); // Changed from imageController to mediaController
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../middlewares/authMiddleware.js");
// SEARCH
router.route("/search").get(authenticateToken, isUser, newsController.search);

//Media
router
  .route("/media") // Changed from "/images" to "/media"
  .get(authenticateToken, isUser, mediaController.allMedia); // Changed from imageController.allImages to mediaController.allMedia
router
  .route("/media") // Changed from "/images" to "/media"
  .delete(authenticateToken, isAdmin, mediaController.deleteMedia); // Changed from imageController.deleteImages to mediaController.deleteMedia
router
  .route("/media/:id") // Changed from "/images/:id" to "/media/:id"
  .patch(
    authenticateToken,
    isAdmin,
    mediaController.uploadMedia, // Changed from imageController.uploadImages to mediaController.uploadMedia
    mediaController.updateMedia // Changed from imageController.updateImage to mediaController.updateMedia
  );
router
  .route("/handleMedia")
  .post(
    authenticateToken,
    isAdmin,
    mediaController.uploadMedia, // Changed from imageController.uploadImages to mediaController.uploadMedia
    mediaController.handleMedia // Changed from imageController.handleImages to mediaController.handleMedia
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
