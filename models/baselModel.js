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

const baselSchema = new mongoose.Schema(
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
            ref: "Device"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    schemaOptions
)

const Basel = mongoose.model('Basel', baselSchema)

module.exports = Basel
