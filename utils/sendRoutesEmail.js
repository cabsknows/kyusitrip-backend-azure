import nodemailer from 'nodemailer'
import config from './config.js'
import routesEmailContent from './routesEmailContent.js'

const sendRoutesEmail = async (email, origin, destination, duration, legs) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.HOST,
      service: config.SERVICE,
      post: config.EMAIL_PORT,
      secure: Boolean(config.SECURE),
      auth: {
        user: config.USER,
        pass: config.PASS
      }
    })

    await transporter.sendMail({
      from: config.USER,
      to: email,
      subject: 'Your Public Transit Itinerary Details',
      html: routesEmailContent(email, origin, destination, duration, legs)
    })
    console.log("Email sent successfully")
  } catch (error) {
    console.log("Email not sent: ", error)
  }
}


export default sendRoutesEmail