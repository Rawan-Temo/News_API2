const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const {
  authenticateToken,
  isAdmin,
  isUser,
} = require("../middlewares/authMiddleware.js");

router.route("/login").post(userController.login); ///api/users/login
router.route("/signup").post(userController.signUp); //api/users/signup
router
  .route("/sendEmail")
  .post(authenticateToken, isAdmin, userController.sendEmail); //api/users/sendEmail
router.route("/verify").post(userController.verify); //api/users/verify
router
  .route("/userVerification")
  .get(authenticateToken, isAdmin, userController.userVerification); //api/users/userVerification
router
  .route("/")
  .get(authenticateToken, isAdmin, userController.getAllUsers) //api/users/
  .post( userController.createUser); //api/users/

router
  .route("/:id")
  .get(authenticateToken, isAdmin,userController.getAUser) //api/users/:id
  .delete(authenticateToken, isAdmin, userController.deleteAUser); //api/users/:id
module.exports = router;
