const router = require('express').Router()
const Address = require('../models/Address.model')
const User = require('../models/User.model')

// GET /api/user/:id/addresses - Gets all addresses of a user by id from the database
router.get('/:userId/addresses', async (req, res, next) => {
  const { userId } = req.params

  const user = await User.findById(userId).populate(
    'addresses.billing addresses.shipping',
  )

  res.status(200).json({
    billing: user.addresses.billing,
    shipping: user.addresses.shipping,
  })
})

// POST /api/user/:userId/new-address/:type - Creates an address for a user in the database depending on the address type
router.post('/:userId/new-address/:type', async (req, res, next) => {
  const { type, userId } = req.params

  const {
    firstName,
    lastName,
    company,
    country,
    street,
    zip,
    city,
    province,
    phone,
    email,
  } = req.body

  try {
    const address = await Address.create({
      user: userId,
      type,
      firstName,
      lastName,
      company,
      country,
      street,
      zip,
      city,
      province,
      phone,
      email,
    })

    if (type === 'billing')
      await User.findByIdAndUpdate(userId, { 'addresses.billing': address._id })
    else if (type === 'shipping')
      await User.findByIdAndUpdate(userId, {
        'addresses.shipping': address._id,
      })

    res.status(200).json({
      address,
      message: `User ${type} address created successfully`,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/user/address/:addressId/:type - Updates an address for a user in the database depending on the address type
router.patch('/:userId/address/:type', async (req, res, next) => {
  const { type, userId } = req.params
  const {
    id, // takes address id from body
    firstName,
    lastName,
    company,
    country,
    street,
    zip,
    city,
    province,
    phone,
    email,
  } = req.body

  try {
    const address = await Address.findByIdAndUpdate(
      id,
      {
        type,
        firstName,
        lastName,
        company,
        country,
        street,
        zip,
        city,
        province,
        phone,
        email,
      },
      { new: true },
    )

    if (type === 'billing')
      await User.findByIdAndUpdate(userId, { 'addresses.billing': address._id })
    else if (type === 'shipping')
      await User.findByIdAndUpdate(userId, {
        'addresses.shipping': address._id,
      })

    res.status(200).json({
      address,
      message: `User ${type} address edited successfully`,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
