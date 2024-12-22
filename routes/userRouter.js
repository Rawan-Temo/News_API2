const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController.js");
router.route("/login").post(userController.login); ///api/users/login
router.route("/signup").post(userController.signUp); //api/users/signup
router.route("/sendEmail").post(userController.sendEmail); //api/users/sendEmail
router.route("/verify").post(userController.verify); //api/users/verify
router.route("/userVerification").get(userController.userVerification); //api/users/userVerification
router
  .route("/")
  .get(userController.getAllUsers) //api/users/
  .post(userController.createUser); //api/users/

router
  .route("/:id")
  .get(userController.getAUser) //api/users/:id
  .delete(userController.deleteAUser); //api/users/:id
module.exports = router;
