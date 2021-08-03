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
            type: Number,
            required: [true, 'Dose is required.']
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

const Basal = mongoose.model('Basal', basalSchema)

module.exports = Basal
