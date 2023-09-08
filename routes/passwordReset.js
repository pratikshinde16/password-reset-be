const { User } = require("../models/user");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require("bcrypt");

//Send Password Links

router.post("/", async (req, res) => {
  try {
    const emailSchema = Joi.object({ email: Joi.string().email().required().label("Email") });
    const { error } = emailSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({message:"user does not exist"});

    let token = await Token.findOne({ userId: user._id });

    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const url = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}/`;
    await sendEmail(user.email, "Password reset", url);

    res.status(200).send({ message: "password reset link sent to your email"});
  } catch (error) {
    res.status(500).send({ message:"Internal server Error"});
    console.log(error);
  }
});

// Verify password reset link

router.get("/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid Link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
         });

    if (!token) return res.status(400).send({ message: "Invalid Link" });

    res.status(200).send({ message: "Valid Link" });
 
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//  set new password
router.post("/:id/:token", async (req, res) => {
  try {
    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label("Password"),
    });
    const { error } = passwordSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    if (!user.verified) user.verified = true;

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashPassword;
    await user.save();

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
