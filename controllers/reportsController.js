import express from 'express'
import Report from '../models/reportModel.js'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import config from '../utils/config.js'
import NodeGeocoder from 'node-geocoder'
const reportsRouter = express.Router()

// Authorization
const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const options = {
  provider: 'google',

  // Optional depending on the providers
  // fetch: customFetchImplementation,
  apiKey: process.env.REACT_APP_API_KEY,
  // formatter: string
};

const geocoder = NodeGeocoder(options);

reportsRouter.get('/', async (req, res) => {
  try {
    const reports = await Report
      .find({})
      .populate('user', { name: 1 })
      
    return res.status(200).json({
      count: reports.length,
      data: reports
    })

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
})


reportsRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const report = await Report.findById(id)
    if (report) {
      return res.status(200).json({ 
        data: report 
      })
    }
    
    return res.status(404).json({ 
      message: "User ID does not exist" 
    })

  } catch (error) {
    res.status(500).json({
      message: "Internal server error"
    })
  }
})


const TTL_DURATIONS = {
  "Traffic": 60 * 60,
  "Hazard": 60 * 60,
  "Accident": 60 * 60,
  "Flood": 60 * 60,
  "Closure": 60 * 60
};


reportsRouter.post('/', async (req, res) => {
  const {latLng, description, category} = req.body

  try {
    if (!latLng || !description || !category) {
      return res.status(400).json({ 
        message: "Please provide values for all required fields: location, title, category, and body." 
      })
    }

    // Token Verification
    const decodedToken = jwt.verify(getTokenFrom(req), config.ACCESS_TOKEN_SECRET)
    if (!decodedToken.id) {
      return res.status(401).json({ 
        error: 'token invalid' 
      })
    }

    const address = await geocoder.reverse({ lat: latLng.lat, lon: latLng.lng });


    const ttlDuration = TTL_DURATIONS[category.label]

    // Save Report
    const user = await User.findById(decodedToken.id)
    const report = new Report ({
      latLng: latLng,
      description: description,
      category: category,
      ttlDuration: ttlDuration, // Include TTL Duration in the report
      address: address[0].formattedAddress,
      user: user.id,
    })
    const savedReport = await report.save()

    await Report.collection.dropIndex("createdAt_1");
    await Report.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: ttlDuration });


    // Update User document
    user.reports = user.reports.concat(savedReport._id)
    await user.save()
    return res.status(201).json({ 
      message: "Report created successfully",
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal server error"
    })
  }
})


reportsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const data = await Report.findByIdAndDelete(id)
    if (!data) {
      return res.status(404).json({ 
        message: "Report not found" 
      })
    }
    return res.status(200).json({
      message: "Report deleted successfully",
    })

  } catch (error) {
    res.status(500).json({ 
      message: "Internal server error"
    })
  }
})

export default reportsRouter