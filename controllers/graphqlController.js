const { buildSchema } = require('graphql')
const User = require('../models/userModel')
const Device = require('../models/deviceModel')

exports.graphqlSchema = buildSchema(`

  input DeviceInput {
    modelType: String!,
    serialNo: String!,
    manufactureDate: String!
  }

  type Device {
      _id: ID!,
      modelType: String!,
      serialNo: String!,
      manufactureDate: String!,
      battery: String!,
      reservoir: String!,
      reservoirDateTime: String!,
      patchDateTime: String!,
      reportedAt: String!
  }  

  type User {
    _id: ID!,
    firstName: String!,
    lastName: String!,
    email: String!,
    phone: String!
    gender: String!,
    country: String!,
    status: String!,
    role: Int!,
    devices: [Device!]!
  }

  type RootQuery {
    users: [User!]!
    loggedUser: User!
    devices: [Device!]!
  }

  type RootMutation {
    createDevice(deviceInput: DeviceInput):Device!
  }

  schema {
    query: RootQuery,
    mutation: RootMutation
  }
`)

exports.graphqlResolver = {
  users: () => {
    return User.find().populate({
      path: "devices",
      select: "-users"
    }).then(users => {
      return users
    }).catch(err => console.log(err))
  },

  loggedUser: (args, req) => {
    return User.findById(req.auth.id).populate({
      path: "devices",
      select: "-users"
    }).then(user => {
      return user
    }).catch(err => console.log(err))
  },

  devices: () => {
    return Device.find().then(devices => {
      return devices
    }).catch(err => console.log(err))
  },

  createDevice: async ({ deviceInput }) => {
    const device = Device({
      serialNo: deviceInput.serialNo,
      modelType: deviceInput.modelType,
      manufactureDate: new Date(deviceInput.manufactureDate)
    })
    await device.save()
    return device
  }
}