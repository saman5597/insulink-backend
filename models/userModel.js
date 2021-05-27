const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, 'Email address is required.'],
      validate: [validator.isEmail, 'Please provide a valid email address.']
    },
    phone: {
      type: Number,
      required: [true, 'Phone number is required.'],
      validate: {
        validator: function (v) {
          return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(v);
        },
        message: '{VALUE} is not a valid phone number.'
      }
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'others']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password is required.'],
      select: false
    },
    pwdResetToken: {
      type: String
    },
    linkExpireTime: {
      type: Date
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { id: false },
  schemaOptions
);

userSchema.virtual('pass')
  .set(function (pass) {
    this._pass = pass;
    this.password = bcrypt.hashSync(pass, 8);
  });

userSchema.methods.comparePassword = function (reqPassword, userPassword) {
  let res = bcrypt.compareSync(reqPassword, userPassword);
  return res;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
