const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  password: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  resetCode: { type: Number },
});
const saltRound = 10;
//  download bcryptjs first!!!
// userSchema.pre("save", function () {
//   bcryptjs.hash(this.password, saltRound, (err, hashedPassword) => {
//     console.log("this is the hashed password", hashedPassword);
//     if (err) {
//       console.log("an error occured while hashing");
//     }
//     this.password = hashedPassword;
//   });
// });

// another one

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     this.password = await bcryptjs.hash(this.password, saltRound);
//     return next();
//   } catch (err) {
//     next(err);
//   }
// });
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
