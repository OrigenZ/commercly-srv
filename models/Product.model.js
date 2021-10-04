const { Schema, model } = require('mongoose')

module.exports = model(
  'Product',
  new Schema(
    {
      sku: {
        type: String,
       required: true,
        unique: true,
      },
      imageUrl: {
        type: String,
      },
      name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
      },
      title: {
        type: String,
      },
      description: {
        type: String,
        required: true,
        minlength: 5,
      },
      price: {
        type: Number,
        required: true,
        minlength: 0,
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
      brand: {
        type: String,
        maxlength: 15,
        minlength: 2,
      },
      manufactureDetails: {
        modelNumber: String,
        releaseDate: Date,
      },
      shippingDetails: {
        weight: Number,
        width: Number,
        height: Number,
        depth: Number,
      },
      quantity: {
        type: Number,
      },
      inCarts: [{
        cartId: {
          type: Schema.Types.ObjectId,
          ref: 'Cart',
        },
        quantity: {
          type: Number,
        },
        timestamp: {
          type: Date,
        },
      }],
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)

//categoria=> array de subcategorías y modelo de subcategoría y propiedad subcategoría en modelo producto
