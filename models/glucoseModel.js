const mongoose = require('mongoose')

const schemaOptions = {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: false
  },
  toObject: {
    virtuals: false
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
      enum: ["0", "1", "2"]  // 0 -> Fasting, 1 -> Non - fasting, 2 -> Random
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: [true, 'Device id is required.']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'User id is required.']
    }
  },
  schemaOptions
)

const Glucose = mongoose.model('Glucose', glucoseSchema)

module.exports = Glucose
