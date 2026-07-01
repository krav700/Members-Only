const { Router } = require("express");
const indexController = require("../controllers/indexController.js");
const passport = require("passport");

const indexRouter = Router();

indexRouter.get("/", indexController.getMessages);
indexRouter.post("/postMessage", indexController.postMessage);
indexRouter.post("/deleteMessage", indexController.deleteMessage);

indexRouter.post("/adminPassword", indexController.checkAdmin);
indexRouter.get("/adminPassword", indexController.getAdminPasswordForm);

indexRouter.post("/prooveMembership", indexController.checkMembershipPassword);
indexRouter.get("/prooveMembership", indexController.getMembershipForm);

indexRouter.post("/login", indexController.loginUser);
indexRouter.get("/login", indexController.getLoginForm);

indexRouter.post("/register", indexController.registerUser);
indexRouter.get("/register", indexController.getRegisterForm);

indexRouter.post("/logout", indexController.logoutUser);


module.exports = indexRouter;
