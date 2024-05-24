import dotenv from 'dotenv'
dotenv.config()



const {
  PORT,
  
  MONGODB_URI,
  ACCESS_TOKEN_SECRET,

  HOST,
  SERVICE,
  EMAIL_PORT,
  SECURE,
  USER,
  PASS
} = process.env

// const URL_USED = 'http://localhost:3000'
const URL_USED = 'https://tq03tq0w-3000.asse.devtunnels.ms'

const config = {
  PORT,
  MONGODB_URI,
  ACCESS_TOKEN_SECRET,
  HOST,
  SERVICE,
  EMAIL_PORT,
  SECURE,
  USER,
  PASS,
  URL_USED
}

export default config