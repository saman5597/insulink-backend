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
      type: Number,
      required: [true, 'Dose is required.']
    },
    bolusType: {
      type: String,
      enum: ["0", "1"],
      required: [true, 'Bolus type is required.']
    },
    fromWizard: {
      type: Boolean,
      default: false
    },
    carbIntake: {
      type: Number
    },
    insulinRatio: {
      type: Number
    },
    insulinSensitivity: {
      type: Number
    },
    lowerBgRange: {
      type: Number
    },
    higherBgRange: {
      type: Number
    },
    activeInsulin: {
      type: Number
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

bolusSchema.index({ date: 1, time: 1, device: 1, user: 1 }, { unique: true })

const Bolus = mongoose.model('Bolus', bolusSchema)

module.exports = Bolus
