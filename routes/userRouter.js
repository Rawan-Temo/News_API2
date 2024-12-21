const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController.js");
router.route("/login").post(userController.login);
router.route("/signup").post(userController.signUp);
router.route("/sendEmail").post(userController.sendEmail);
router.route("/verify").post(userController.verify);
router.route("/userVerification").get(userController.userVerification);
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getAUser)
  .delete(userController.deleteAUser);
module.exports = router;
