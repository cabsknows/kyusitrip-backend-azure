import mongoose from 'mongoose'

const routeSchema = new mongoose.Schema({
  origin: {
    type: Object,
    required: true
  },
  destination: {
    type: Object,
    required: true
  },
})

routeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Route = mongoose.model('Route', routeSchema)

export default Route