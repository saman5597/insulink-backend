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

const basalSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, 'Date is required.']
        },
        startTime: {
            type: String,
            required: [true, 'Time is required.']
        },
        endTime: {
            type: String,
            required: [true, 'Dose is required.']
        },
        flow: {
            type: String,
            required: [true, 'Dose is required.']
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

const Basal = mongoose.model('Basal', basalSchema)

module.exports = Basal
