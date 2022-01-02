const router = require('express').Router()
const mongoose = require('mongoose')
const User = require('../models/User.model')
const Order = require('../models/Order.model')

//GET /api/orders - Get all orders from the database
router.get('/', async (req, res, next) => {
  const orders = await Order.find().populate('customer')
  try {
    res.status(200).json(orders)
  } catch (err) {
    next(err)
  }
})

//GET /api/orders/:orderId - Get an order by order id from the database
router.get('/:orderId', async (req, res, next) => {
  const { orderId } = req.params
  try {
    const orders = await Order.findById(orderId).populate(
      'customer orderLines.productId',
    )
    res.status(200).json(orders)
  } catch (err) {
    next(err)
  }
})

//GET /api/orders/customer/:customerId - Get orders by customer id from the database
router.get('/customer/:customerId', async (req, res, next) => {
  const { customerId } = req.params
  try {
    const orders = await Order.find({ customer: customerId }).populate(
      'customer',
    )
    res.status(200).json(orders)
  } catch (err) {
    next(err)
  }
})

//POST /api/orders - Creates an order in the database
router.post('/', async (req, res, next) => {
  const {
    customer,
    status,
    shippingFees,
    orderLines,
    totalTaxes,
    totalOrder,
  } = req.body
  try {
    const orders = await Order.create({
      customer,
      status,
      shippingFees,
      orderLines,
      totalTaxes,
      totalOrder,
    })
    res.status(200).json(orders)
  } catch (err) {
    next(err)
  }
})

//PATCH /api/orders/:orderId - Edits an order from the database by order id
router.patch('/:orderId', async (req, res, next) => {
  const { orderId } = req.params
  const {
    customer,
    status,
    orderLines,
    totalOrder,
    totalTaxes,
    shippingFees,
  } = req.body
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { customer, status, orderLines, totalOrder, totalTaxes, shippingFees },
      { new: true },
    ).populate('customer')
    res.status(200).json(order)
  } catch (err) {
    next(err)
  }
})

//DELETE /api/orders/:orderId - Deletes an order from the database by order id
router.delete('/:orderId', async (req, res, next) => {
  const { orderId } = req.params
  try {
    const order = await Order.findByIdAndDelete(orderId).populate('customer')
    res.status(200).json(order)
  } catch (err) {
    next(err)
  }
})

module.exports = router
