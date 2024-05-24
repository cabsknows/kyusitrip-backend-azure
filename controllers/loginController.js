import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/userModel.js'
import Token from '../models/token.js'
import sendEmail from '../utils/sendEmail.js'
import crypto from 'crypto'
import config from '../utils/config.js'
const loginRouter = express.Router()

loginRouter.post('/', async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ 
      message: "Sorry, the email you entered is not registered. Please check your email or register for a new account."
    })
  }

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ 
      message: "User has entered invalid email or password"
    })
  }

  if (!user.verified) {
    let token = await Token.findOne({ userId: user._id })
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex")
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
        "If you didn't create an account with us, please disregard this email. It's possible that someone entered your email address mistakenly during the registration process."
      )

      return res.status(401).json({
        message: "We've sent an email to your account. Your account is not fully active until verification is complete."
      })
    }
    return res.status(401).json({
      message: "Your email is not verified. Please check your email"
    })
  }

  const userForToken = {
    email: user.email,
    id: user._id
  }

  const token = jwt.sign(
    userForToken, 
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: 60*60 }
  )

  res.status(200).json({
    token,
    email: user.email,
    name: user.name,
  })
})

export default loginRouter