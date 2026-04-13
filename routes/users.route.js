const express = require("express");

const {
  createUser,
  getUsers,
  deleteUser,
  getUserId,
  updateUser,
  PatchUser,
  loginUser,
  userToken,
  dashBoard,
  resetPassword,
  forgotPassword,
  verifyEmail,
} = require("../controller/users.controller");
const { verifyToken, isAdmin } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post("/create-user", createUser);
router.post("/loginUser", loginUser);
router.get("/get-users", verifyToken, isAdmin, getUsers);
router.get("/get-user/:id", verifyToken, isAdmin, getUserId);
router.delete("/delete-user/:id", verifyToken, isAdmin, deleteUser);
router.put("/update-user/:id", verifyToken, isAdmin, updateUser);
router.patch("/patch-user/:id", verifyToken, isAdmin, PatchUser);
router.get("/userToken", userToken);
router.get("/dashBoard", verifyToken, isAdmin, dashBoard);
router.post("/forgot-password", forgotPassword);
router.post("/verify-email", verifyEmail);
router.post("/reset-password", resetPassword);

module.exports = router;
