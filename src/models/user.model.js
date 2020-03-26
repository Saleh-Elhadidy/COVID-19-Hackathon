/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    userLevel: {
      type:Number,
      required:true,
      default:0,
    },
  },
  { timestamps: true },
);
if (!userSchema.options.toObject) userSchema.options.toObject = {};

userSchema.options.toObject.transform = (doc, ret) => {
  delete ret.password;

  return ret;
};

module.exports = mongoose.model('User', userSchema);