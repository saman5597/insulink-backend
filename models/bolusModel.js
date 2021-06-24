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

const bolusSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required.']
    },
    time: {
      type: String,
      required: [true, 'Time is required.']
    },
    dose: {
      type: String,
      required: [true, 'Dose is required.']
    },
    bolusType: {
      type: String,
      enum: ["0", "1", "2"],
      required: [true, 'Bolus type is required.']
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

const Bolus = mongoose.model('Bolus', bolusSchema)

module.exports = Bolus
