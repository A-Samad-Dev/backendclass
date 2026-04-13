const jwt = require("jsonwebtoken");
const userModel = require("../Model/users.model");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided in the Authorization header");
    return res.status(401).json({
      status: false,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decoded);
    if (decoded) {
      console.log("Token verified successfully: ", decoded);
      const user = await userModel.findOne({ email: decoded.email });

      if (!user) {
        console.log("User not found with email: ", decoded.email);
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      req.user = user; // Attach the decoded token to the request object
      next(); // Call the next middleware function
    }
  } catch (err) {
    console.log("Token verification failed: ", err.message);
    if (err.message == "invalid signature") {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Invalid token",
      });
    } else if (err.message == "jwt expired") {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token expired",
      });
    }
  }
};

const isAdmin = (req, res, next) => {
  // const authHeader = req.headers.authorization;

  // if(!authHeader || !authHeader.startsWith('Bearer ')){
  //     console.log('No token provided in the Authorization header')
  //     return res.status(401).json({
  //         status: false,
  //         message: 'Unauthorized: No token provided'
  //     })
  // }

  // const token = authHeader.split(' ')[1];

  // const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const user = req.user; // Get the decoded token from the request object
  if (user.role !== "admin") {
    console.log("User is not an admin: ", user.email);
    res.status(403).json({
      status: false,
      message: "Unauthorized: User is not an admin",
    });
  } else {
    console.log("User is an admin: ", user.email);
    next();
  }
};
module.exports = {
  verifyToken,
  isAdmin,
};
