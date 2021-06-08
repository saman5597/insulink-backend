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
        modelName: {
            type: String,
            enum: ['standard', 'pro'],
            default: 'standard',
            required: [true, 'Model Name is required.']
        },
        manufactureDate: {
            type: Date,
            required: [true, 'Manufacture Date is required.']
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


