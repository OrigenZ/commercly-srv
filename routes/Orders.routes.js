const router = require('express').Router()
const mongoose = require('mongoose')
const User = require('../models/User.model')
const Order = require('../models/Order.model')

//GET /api/orders - Get all orders from the database
router.get('/', async (req, res, next) => {
  Order.find()
    .populate('customer')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//GET /api/orders/:orderId - Get an order by order id from the database
router.get('/:orderId', (req, res, next) => {
  const { orderId } = req.params

  Order.findById(orderId)
    .populate('customer')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//GET /api/orders/customer/:customerId - Get orders by customer id from the database
router.get('/customer/:customerId', (req, res, next) => {
  const { customerId } = req.params

  Order.find({ 'user._id': customerId })
    .populate('customer')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//POST /api/orders - Creates an order in the database
router.post('/', (req, res, next) => {
  const { customer, status, date, orderLines, totalOrder } = req.body

  Order.create({ customer, status, date, orderLines, totalOrder })
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//PATCH /api/orders/:orderId - Edits an order from the database by order id
router.patch('/:orderId', (req, res, next) => {
  const { orderId } = req.params
  const { customer, status, date, orderLines, totalOrder } = req.body

  Order.findByIdAndUpdate(
    orderId,
    { customer, status, date, orderLines, totalOrder },
    { new: true },
  )
    .populate('customer')
    .then((order) => res.status(200).json(order))
    .catch((err) => next(err))
})

//DELETE /api/orders/:orderId - Deletes an order from the database by order id
router.delete('/:orderId', (req, res, next) => {
  const { orderId } = req.params

  Order.findByIdAndDelete(orderId)
    .populate('customer')
    .then((order) => res.status(200).json(order))
    .catch((err) => next(err))
})

module.exports = router
