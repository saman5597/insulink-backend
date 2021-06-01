const mongoose = require('mongoose')

const schemaOptions = {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
}

const glucoseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required.']
    },
    readingTime: {
      type: String,
      required: [true, 'Reading time is required.']
    },
    glucoseReading: {
      type: Number,
      required: [true, 'Glucose reading is required.']
    },
    readingType: {
      type: String,
      required: [true, 'Glucose reading type is required.'],
      enum: ['N', 'F']
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  },
  schemaOptions
)

const Glucose = mongoose.model('Glucose', glucoseSchema)

module.exports = Glucose
