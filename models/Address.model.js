const { Schema, model } = require('mongoose')

module.exports = model(
  'Address',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Address user id is required'],
      },
      type: String,
      firstName: {
        type: String,
        required: [true, 'Address first name is required'],
      },
      lastName: {
        type: String,
        required: [true, 'Address last name is required'],
      },
      company: String,
      country: {
        type: String,
        required: [true, 'Address country is required'],
      },
      street: {
        type: String,
        required: [true, 'Address street is required'],
      },
      city: {
        type: String,
        required: [true, 'Address city is required'],
      },
      province: {
        type: String,
        required: [true, 'Address province is required'],
      },
      zip: {
        type: String,
        required: [true, 'Address zip is required'],
      },
      phone: {
        type: String,
        required: [true, 'Address phone is required'],
      },
      email: {
        type: String,
        required: [true, 'Address email is required'],
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)
