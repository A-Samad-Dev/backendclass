const userModel = require("../Model/users.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { Query } = require("mongoose");git
const nodemailer = require("nodemailer");

 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "olokoadesola@gmail.com",
    pass: "mvmasuglvrvwpcub",
  },
});

const createUser = async (req, res) => {
  try {
    const { name, email, password, registrationDate } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      console.log("the data must be inputed");
      res.status(404).json({
        status: false,
        message: "all fields are required ",
      });
    }

    const checkUser = await userModel.findOne({ email });
    if (checkUser) {
      console.log("user already exist");
      res.status(404).json({
        status: false,
        message: "user already exists with this email",
      });
    } else {
      let saltRound = 10;
      const hashedPassword = await bcryptjs.hash(password, saltRound);
      console.log("this is the hashed password: ", hashedPassword);

      req.body.role = "user";

      const newUser = new userModel({ ...req.body, password: hashedPassword });
      await newUser.save();
     
      const mailOptions = {
        from: `Backend class <olokoadesola1@gmail.com>`,
        to: newUser.email,
        subject: "Welcome to our platform!",
        text: `Hi ${newUser.name},\n\nThank you for registering on our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`,
      };
      await transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log("Error sending email: ", err);
        }else{
          console.log("Email sent successfully: ", info);
        }

      });
      res.status(201).json({
        status: true,
        message: "user registration successful",
        data: {
          name: newUser.name,
          email: newUser.email,
          registrationDate: newUser.registrationDate,
          role: newUser.role,
        },
      });
    }
  } catch (error) {
    console.log("error registering new user ", error);

    res
      .status(500)
      .json({ status: false, message: "internal server error!", error });
  }
};

const loginUser = async (req, res) => {
  console.log("request from client", req.body);

  const { email, password } = req.body;
  console.log(email);
  try {
    if (!email || !password) {
      console.log("email and password required");
      res.status(401).json({
        status: false,
        message: "email and passwrod required",
      });
    }
    const userExist = await userModel.findOne({ email });
    if (!userExist) {
      console.log("no user found");
      res.status(404).json({
        status: false,
        message:
          "no user found, kindly check inputs or register another account",
      });
    }
    const isMatch = await bcryptjs.compare(password, userExist.password);
    console.log("is the password correct?", isMatch);
    if (!isMatch) {
      console.log("incorrect details");
      res.status(400).json({
        status: false,
        message: "email or password incorrect",
      });
    }
    const token = jwt.sign(
      { id: userExist._id, email: userExist.email, role: userExist.role },
      process.env.SECRET_KEY,
      { expiresIn: "12 minutes" },
    );
    console.log("this is the generated token: ", token);

    res.status(200).json({
      status: true,
      message: " Login Successful",
      data: {
        name: userExist.name,
        email: userExist.email,
        registrationDate: userExist.registrationDate,
        role: userExist.role,
      },
      token,
    });
    // console.log("successfully logged in", {
    //   status: true,
    //   message: " Login Successful",
    //   data: {
    //     name: userExist.name,
    //     email: userExist.email,
    //     registrationDate: userExist.registrationDate,
    //     role: userExist.role,
    //   },
    //   token,
    // });
  } catch (error) {
    console.log("an error occured", error);

    res.status(500).json({
      status: false,
      message: error,
    });
  }
};

const userToken = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);

  try {
    if (token) {
      const verifiedToken = await jwt.verify(token, process.env.SECRET_KEY);
      console.log(verifiedToken);
      res.status(200).json({
        status: true,
        message: "token validation succcessful",
        data: verifiedToken,
      });
    } else {
      console.log("no token found, kindly login");
      res.status(404).json({
        status: false,
        message: "no token found",
      });
    }
  } catch (err) {
    console.log("error while validating token", err);
  }
};
// GET USERS
const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res
      .status(200)
      .json({ status: true, message: "retrieved all users", data: users });
  } catch (error) {
    res.status(500).json({ message: "error retrueving users" });
  }
};

const getUser = async (req, res) => {
  try {
    console.log("this is user details from the token: ", req.user);

    res.status(200).json({
      status: true,
      message: "User retrieved successfully",
      data: req.user,
    });
  } catch (err) {
    console.log("Error retrieving user: ", err.message);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Invalid token",
      });
    }
    res.status(500).json({
      status: false,
      message: "An error occurred while retrieving the user",
    });
  }
};

const getUserId = async (req, res) => {
  try {
    const { id } = req.params;
    if (id.trim() === "") {
      console.log("user id is required to proceed");
      res.status(400).json({ status: false, message: "kindly input id" });
    }
    const user = await userModel.findById(id);
    if (!user) {
      console.log("user not found :", id);
      res.status(400).json({
        status: false,
        message: "user not found",
      });
    }
    res.status(200).json({
      status: true,
      message: "user retrieved successfully",
      data: user,
    });
  } catch (err) {
    console.log("error retrieving user: ", err);
    res.status(400).json({
      status: false,
      message: err,
    });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id.trim === "") {
      res.status(400).json({
        status: false,
        message: "user id is required",
      });
    }
    const User = await userModel.findById(id);
    if (!User) {
      res.status(400).json({
        status: false,
        message: `user not found`,
      });
    }
    await userModel.findByIdAndDelete(id);
    console.log("successfully deleted: ", User);

    res.status(200).json({
      status: true,
      message: "user deleted sucessfully",
      data: `user deleted: ${User}, existing Users: ${userModel.find()}`,
    });
  } catch (error) {
    console.log("error deleting, ", error);

    res
      .status(500)
      .json({ status: false, message: "error deleting user from database" });
  }
};
const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id.trim === "") {
      res.status(400).json({
        status: false,
        message: "user id is required",
      });
    }
    const User = await userModel.findById(id);
    if (!User) {
      console.log("User not found with id: ", id);
      res.status(400).json({
        status: false,
        message: `user not found`,
      });
    }
    const updateUser = await userModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      ststus: true,
      message: "successfully updated",
      data: updateUser,
    });
  } catch (err) {
    console.log("error updating user: ", err);
    res.status(500).json({ status: false, message: "error updating" });
  }
};
const PatchUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id || id.trim() === "") {
      console.log("user not found ");
      res.status(400).json({ status: false, message: "user not found" });
    }
    const user = await userModel.findById(id);

    if (!user) {
      console.log("user not found woth id:", id);
      res.status(401).json({
        status: false,
        message: "user not found",
      });
      const updateUser = await userModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true },
      );
      res.status(200).json({
        status: true,
        message: "user updated successfully",
        data: updateUser,
      });
    }
  } catch (err) {
    console.log("error while trying to patch", err);
    res.status(500).json({ status: false, message: "error while patching " });
  }
};
const dashBoard = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      status: false,
      message: "No token provided",
    });
  }

  const token = req?.headers.authorization.split(" ")[1];
  console.log(token);

  try {
    if (token) {
      const verifiedToken = await jwt.verify(token, process.env.SECRET_KEY);
      console.log(verifiedToken);
      const user = await userModel.findById(verifiedToken.id);
      res.status(200).json({
        status: true,
        message: "token validation succcessful",
        data: { verifiedToken, user },
      });
    } else {
      console.log("no token found, kindly login");
      res.status(404).json({
        status: false,
        message: "no token found",
      });
    }
  } catch (err) {
    console.log("error while validating token", err);
  }
};
const promoteToAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    const userToPromote = await userModel.findOne({ email });

    if (!userToPromote) {
      console.log("User not found with this email: ", email);
      res.status(404).json({
        status: false,
        message: "User not found with this email",
      });
    }

    const promoteToAdmin = await userModel.findByIdAndUpdate(
      userToPromote._id,
      { role: "admin" },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: true,
      message: "User promoted to admin successfully",
      data: promoteToAdmin,
    });
  } catch (err) {
    console.log("Error promoting user to admin: ", err);
    res.status(500).json({
      status: false,
      message: "An error occurred while promoting the user to admin",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try{
    if(!email || email.trim() === ""){
      console.log("email is required to proceed");
      res.status(400).json({
        status: false,
        message: "email is required",
      });
    }
    const user = await userModel.findOne({ email });
    if(!user){
      console.log("no user found with this email: ", email);
      res.status(404).json({
        status: false,
        message: "no user found with this email",
      });
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated reset code: ", code);
    user.resetCode = code;
    await user.save();
    const sendCode = await transporter.sendMail({
      from: `Backend class <olokoadesola1@gmail.com>`,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${code}`,
    });
    console.log("Reset code sent successfully: ", sendCode);
    res.status(200).json({
      status: true,
      message: "Password reset code sent to email",
    });
   
  }catch(err){
    console.log("Error handling forgot password: ", err);
    res.status(500).json({
     status: false,
     message: "An error occurred while handling forgot password",
    });
  }
};

const verifyEmail = async (req, res) => {
  console.log(req.body.code);

  const {code} = req.body;

  const {email} = req.query;

  try{
    if(!code || code.trim() === ""|| !email || email.trim() === ""){
      console.log("Code and email are required");
      res.status(400).json({
        status: false,
        message: "Code and email are required",
      });
    }
      const user= await userModel.findOne({ email });
      if(!user){
        console.log("no user found with this email: ", email);
        res.status(404).json({
          status: false,
          message: "no user found with this email",
        });
      } else if(user.resetCode !== parseInt(code)){
        console.log("Invalid reset code");
        res.status(400).json({
          status: false,
          message: "Invalid reset code",
        });
        } else {
        console.log("Reset code verified successfully");
        res.status(200).json({
          status: true,
          message: "Reset code verified successfully",
        });

    }
  }catch(err){
    err.status(500).json({
      status: false,
      message: "An error occurred while verifying reset code",
    });

  }
};

const resetPassword = async (req, res) => {
  const { email, code} = req.query;
  const { newPassword } = req.body;
  try{
    if(!email || email.trim() === ""|| !newPassword || newPassword.trim() === "" || !code || code.trim() === ""){
      console.log("Email, new password, and reset code are required");
      res.status(400).json({
        status: false,
        message: "Email, new password, and reset code are required",
      });
    }
    const user = await userModel.findOne({ email });  
    if(!user){
      console.log("no user found with this email: ", email);
      res.status(404).json({
        status: false,
        message: "no user found with this email",
      });
    } else if(user.resetCode !== parseInt(code)){
      console.log("Invalid reset code");
      res.status(400).json({
        status: false,
        message: "Invalid reset code",
      });
    } else {
      const saltRound = 10;
      const hashedPassword = await bcryptjs.hash(newPassword, saltRound);
      user.password = hashedPassword;
      user.resetCode = null;
      await user.save();
      res.status(200).json({
        status: true,
        message: "Password reset successfully",
      });
    }

  }catch(err){
    console.log("Error resetting password: ", err);
    res.status(500).json({
      status: false,
      message: "An error occurred while resetting password",
    });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  getUserId,
  deleteUser,
  updateUser,
  PatchUser,
  loginUser,
  userToken,
  dashBoard,
  promoteToAdmin,
  forgotPassword,
  verifyEmail,
  resetPassword,
}
