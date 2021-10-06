const { Schema, model } = require('mongoose')

module.exports = model(
  'Order',
  new Schema(
    {
      customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order user id is required'],
      },
      status: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing',
      },
      shippingFees:{
        type: Number,
        required: [true, 'Order shipping fee  is required'],
      },
      orderLines: [
        {
          quantity: {
            type: Number,
            required: [true, 'Order line quantity is required'],
          },
          productId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Order line product id is required'],
            ref: 'Product',
          },
          totalLine: {
            type: Number,
            required: [true, 'Order line total  is required'],
          },
        },
      ],
      totalTaxes: {
        type: Number,
        required: [true, 'total taxes is required'],
      },
      totalOrder: {
        type: Number,
        required: [true, 'Order grand total  is required'],
      },
    },
    {
      timestamps: true,
      versionKey: false,
    },
  ),
)