const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../middlewares/authMiddleware.js");
// Route for fetching all comments and creating a new one
router
  .route("/")
  .get(authenticateToken, isUser, commentsController.getAllComments) // GET /api/categories
  .post(authenticateToken, commentsController.addComment); // POST /api/categories

// Route for fetching, updating, and deleting a specific category
router
  .route("/:id")
  .get(authenticateToken, isUser, commentsController.getCommentById) // GET /api/categories/:id
  .patch(authenticateToken, commentsController.updateComment) // PATCH /api/categories/:id
  .delete(authenticateToken, commentsController.deleteComment); // PATCH /api/categories/deActivate/:id

module.exports = router;
