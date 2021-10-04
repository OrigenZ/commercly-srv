const { Schema, model } = require('mongoose')

module.exports = model(
  'Order',
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing',
      },
      date: {
        type: Date,
        required: true,
      },
      orderLines: [
        {
          quantity: {
            type: Number,
            required: true,
          },
          productId: {
            type: Schema.Types.ObjectId,
            required: true,
          },
          totalLine: {
            type: Number,
            required: true,
          },
        },
      ],
      totalOrder: {
        type: Number,
        required: true,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)

/*
user
date
orderLines
    quantity
    productId
    totaLine
totalOrder
*/
