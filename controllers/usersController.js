import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import Token from '../models/token.js'
import sendEmail from '../utils/sendEmail.js'
import validator from 'validator'
import crypto from 'crypto'
import config from '../utils/config.js'
const usersRouter = express.Router()

usersRouter.get('/', async (req, res) => {
  try {
    const users = await User
      .find({})
      .populate('reports', {location: 1, title: 1, category: 1})
    return res.status(200).json({ 
      count: users.length, 
      data: users 
    })

  } catch (error) {
    res.status(500).json({ 
      message: "Internal server error"
    })
  }
})


usersRouter.post('/', async (req, res) => {
  const emailValidation = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  const { name, password, email } = req.body

  try {
    // Email Uniqueness
    let user = await User.findOne({ email: email })
    if (user) {
      return res.status(409).json({ 
        message: "Sorry, the email you provided is already registered. If you have an account, please log in. If not, try using a different email address." 
      })
    }

    if (!name || !email || !password) {
      return res.status(404).json({
        message: "Please provide all the required information. Make sure to fill in your name, password, and email."
      })
    }

    // Email and Password Validation
    if (!emailValidation.test(email) 
        && !validator.isStrongPassword(password, {
          minLength: 8, minLowercase: 1, minUppercase: 1, 
          minNumbers: 1, minSymbols: 1 
    })) {
      return res.status(400).json({
        message: "Invalid email format and weak password. Please use the format 'example@gmail.com' and choose a stronger password with at least 8 characters, including uppercase and lowercase letters, numbers, and special symbols."
      })
    }

    // Email Validation
    if (!emailValidation.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format. Please use the format 'example@gmail.com." 
      });
    }

    // Password Validation
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

    // Password Hashing
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    user = await new User({
      name,
      passwordHash,
      email,
    }).save()

    // Create Token
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex')
    }).save()

    const url = `${config.URL_USED}/users/${user._id}/verify/${token.token}`
    await sendEmail(
      user.email, 
      user.name,
      url,
      "Welcome to RouteWise", 
      "account verification process",
      "Thank you for signing up! We're excited to have you on board.",
      "Verify Email",
      "If you didn't create an account with us, please disregard this email. It's possible that someone entered your email address mistakenly during the registration process. No action is required on your part."
    )
    
    res.status(200).json({
      message: "Registration successful! An email has been sent for account verification.",
    })

  } catch (error) {
    return res.status(500).send({ 
      message: "Internal server error" 
    })
  }
})


usersRouter.get('/:id/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.id})
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

    await User.updateOne({_id: user._id}, {verified: true})

    return res.status(200).json({
      message: "Your email has been successfully verified"
    })

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})


usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const data = await User.findByIdAndDelete(id)

    if (!data) {
      return res.status(404).json({ 
        message: "User not found" 
      })
    }

    return res.status(200).json({ 
      message: "User deleted successfully",
    })

  } catch (error) {
    res.status(500).json({ 
      message: "Internal server error"
    })
  }
})

export default usersRouter
