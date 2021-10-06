const router = require('express').Router()
const mongoose = require('mongoose')
const User = require('../models/User.model')
const Order = require('../models/Order.model')

//GET /api/orders - Get all orders from the database
router.get('/api/orders', async (req, res, next) => {
  Order.find()
    .populate('user')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//GET /api/orders/:orderId - Get an order by order id from the database
router.get('/api/orders/:orderId', (req, res, next) => {
  const { orderId } = req.params

  Order.findById(orderId)
    .populate('user')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//GET /api/orders/customer/:customerId - Get orders by customer id from the database
router.get('/api/orders/customer/:customerId', (req, res, next) => {
  const { customerId } = req.params

  Order.find({ 'user._id': customerId })
    .populate('user')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//POST /api/orders - Creates an order in the database
router.post('/api/orders', (req, res, next) => {
  const { user, status, date, orderLines, totalOrder } = req.body

  Order.create({ user, status, date, orderLines, totalOrder })
    .populate('user')
    .then((orders) => res.status(200).json(orders))
    .catch((err) => next(err))
})

//PATCH /api/orders/:orderId - Edits an order from the database by order id
router.patch('/api/orders/:orderId', (req, res, next) => {
  const { orderId } = req.params
  const { user, status, date, orderLines, totalOrder } = req.body

  Order.findByIdAndUpdate(
    orderId,
    { user, status, date, orderLines, totalOrder },
    { new: true },
  )
    .populate('user')
    .then((order) => res.status(200).json(order))
    .catch((err) => next(err))
})

//DELETE /api/orders/:orderId - Deletes an order from the database by order id
router.delete('/api/orders/:orderId', (req, res, next) => {
  const { orderId } = req.params

  Order.findByIdAndDelete(orderId)
    .populate('user')
    .then((order) => res.status(200).json(order))
    .catch((err) => next(err))
})

module.exports = router
