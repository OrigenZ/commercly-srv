const { Schema, model } = require('mongoose')

module.exports = model(
  'User',
  new Schema(
    {
      name: {
        type: String,
        minlength: [2, 'User first name must be at least 2 characters long'],
      },
      surname: {
        type: String,
        minlength: [2, 'User last name must be at least 2 characters long'],
      },
      addresses: {
        billing: {
          type: Schema.Types.ObjectId,
          ref: 'Address',
        },
        shipping: {
          type: Schema.Types.ObjectId,
          ref: 'Address',
        },
      },
      phone: String,
      username: String,
      email: {
        type: String,
        required: [true, 'Field email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
        unique: [true, 'This email is already in use'],
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'Field password is required'],
        match: [
          /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
          'Password must be 6 characters long and have one number, one lowercase and one uppercase letter.',
        ],
      },
      isAdmin: Boolean,
      cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)
