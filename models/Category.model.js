const { Schema, model } = require('mongoose')

module.exports = model(
  'Category',
  new Schema(
    {
      name: {
        type: String,
        minlength: [3, 'Category name must be at least 3 characters long'],
        required: [true, 'Category name  is required'],
      },
      description: String,
      products: {
        type: [Schema.Types.ObjectId],
        ref: 'Product',
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)
