import express from 'express'
import User from '../models/userModel.js'
import Token from '../models/token.js'
import crypto from 'crypto'
import config from '../utils/config.js'
import sendEmail from '../utils/sendEmail.js'
import Joi from 'joi'
import validator from 'validator'
import passwordComplexity from 'joi-password-complexity'
import bcrypt from 'bcrypt'

const passwordReset = express.Router()

// send password link
passwordReset.post('/', async (req, res) => {
  const { email } = req.body
  try {
    const emailSchema = Joi.object({
      email:Joi.string().email().required().label("Email")
    })
    const { error } = emailSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message 
      })
    }

    let user = await User.findOne({ email: email })
    if (!user) {
      return res.status(409).json({ 
        message: "User with given email does not exist!" 
      })
    }

    let token = await Token.findOne({ userId: user._id })
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex')
      }).save()
    }

    const url = `${config.URL_USED}/password-reset/${user._id}/${token.token}`
    await sendEmail(
      user.email,
      user.name,
      url,
      "Password Reset", 
      "account password reset",
      "We received a request to reset your RouteWise account password.",
      "Reset Password",
      "If you didn't request a password reset, you can safely ignore this email. Someone else might have typed your email address by mistake."
    )

    res.status(200).json({
      message: "Password reset link is sent to your email account, please check."
    })

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
})

// verify url
passwordReset.get("/:id/:token", async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findOne({_id: id})
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid user link" 
      })
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token
    })

    if (!token) {
      return res.status(400).json({ 
        message: "Invalid token link" 
      })
    }

    res.status(200).json({ 
      message: "Valid Url" 
    })

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
})

// reset password
passwordReset.post("/:id/:token", async (req, res) => {
  const { id } = req.params
  const { password } = req.body

  try {
    if (!validator.isStrongPassword(password, {
      minLength: 8, 
      minLowercase: 1, 
      minUppercase: 1, 
      minNumbers: 1, 
      minSymbols: 1 
    })) {
      return res.status(400).json({ 
        message: "Weak Password. Choose a stronger password with at least 8 characters, including uppercase and lowercase letters, numbers, and special symbols" })
    }

    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label("Password")
    })
    const { error } = passwordSchema.validate(req.body)

    const user = await User.findOne({_id: id})
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid user link" 
      })
    }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token
    })
    if (!token) {
      return res.status(400).json({ 
        message: "Invalid token link" 
      })
    }

    if (!user.verified) {
      user.verified = true
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    user.passwordHash = passwordHash
    await user.save()


    res.status(200).json({ 
      message: "Password reset successful" 
    })

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
})


export default passwordReset