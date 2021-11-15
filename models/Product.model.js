const { Schema, model } = require('mongoose')

module.exports = model(
  'Product',
  new Schema(
    {
      sku: {
        type: String,
        required: [true, 'Field SKU is required'],
        unique: true,
      },
      imageUrl: {
        type: String,
      },
      name: {
        type: String,
        required: [true, 'Product name is required'],
        unique: true,
        minlength: [3, 'Product name must be at least 3 characters long'],
      },
      description: {
        type: String,
        required: true,
        minlength: [
          5,
          'Product description must be at least 5 characters long',
        ],
      },
      price: {
        type: Number,
        required: [true, 'Product price is required'],
        minlength: [0, 'Product price cannot be less than 0'],
      },
      totalPrice: {
        type: Number,
      },
      tax: {
        type: Number,
        required: [true, 'Product tax is required'],
        minlength: [0, 'Product tax cannot be less than 0'],
      },
      category: {
        type: Schema.Types.ObjectId,
        required: [true, 'Product category is required'],
        ref: 'Category',
      },
      brand: {
        type: String,
        maxlength: [15, 'Product brand cannot more than 15 characters long'],
        minlength: [2, 'Product brand must be at least 2 characters long'],
      },
      shippingDetails: {
        weight: Number,
        width: Number,
        height: Number,
        depth: Number,
      },
      quantity: {
        type: Number,
        required: [true, 'Product quantity is required'],
        min: [0, 'Product quantity cannot be less than 0'],
      },
      inCarts: [
        {
          cartId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Cart id is required'],
            ref: 'Cart',
          },
          quantity: {
            type: Number,
          },
          timestamp: {
            type: Date,
          },
        },
      ],
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)

//categoria=> array de subcategorías y modelo de subcategoría y propiedad subcategoría en modelo producto
