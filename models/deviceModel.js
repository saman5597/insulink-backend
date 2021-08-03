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

const deviceSchema = new mongoose.Schema(
    {
        serialNo: {
            type: String,
            unique: true,
            required: [true, 'Serial No. is required.']
        },
        modelType: {
            type: String,
            enum: ['standard', 'pro'],
            default: 'standard',
            required: [true, 'Model type is required.']
        },
        manufactureDate: {
            type: Date,
            required: [true, 'Manufacture date is required.']
        },
        battery: {
            type: Number,
            min: 0,
            max: 100
        },
        reservoir: {
            type: Number,
            min: 0,
            max: 100
        },
        reservoirDateTime: {
            type: Date
        },
        patchDateTime: {
            type: Date
        },
        reportedAt: {
            type: Date
        },
        users: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User"
        }
    },
    schemaOptions
)

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device


