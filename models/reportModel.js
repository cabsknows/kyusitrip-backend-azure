import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    latLng: {
      type: Object,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: Object,
      required: true
    },
    ttlDuration: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
)

reportSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Report = mongoose.model('Report', reportSchema)

export default Report