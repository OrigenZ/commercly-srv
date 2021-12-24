const router = require('express').Router()
const bcryptjs = require('bcryptjs')
const saltRounds = 10

const Address = require('../models/Address.model')
const User = require('../models/User.model')

// GET /api/users - Gets all users from the database
router.get('/', (_, res, next) => {
  User.find()
    .populate('addresses.billing addresses.shipping')
    .then((users) => {
      res.status(200).json(users)
    })
    .catch((err) => next(err))
})

// GET /api/users/:id - Gets a user by it's id from the database
router.get('/:id', (req, res, next) => {
  const { id } = req.params

  User.findById(id)
    .populate('addresses.billing addresses.shipping')
    .then((user) => {
      user.password = undefined
      res.status(200).json(user)
    })
    .catch((err) => next(err))
})

// PATCH /api/users/:id - Edits a user in the database
router.patch('/:id', (req, res, next) => {
  const { id } = req.params

  if (req.body.password) {
    const salt = bcryptjs.genSaltSync(saltRounds)
    const hashedPassword = bcryptjs.hashSync(req.body.password, salt)

    req.body.password = hashedPassword
  }

  User.findByIdAndUpdate(id, req.body, { new: true })
    .then((user) => {
      user.password = undefined
      res.status(200).json({ user, message: 'User updated successfully' })
    })
    .catch((err) => next(err))
})

// DELETE /api/users/:id - Deletes a user from the database
router.delete('/:id', (req, res, next) => {
  const { id } = req.params

  User.findByIdAndDelete(id)
    .then((user) => {
      res.status(200).json({ user, message: 'User deleted successfully' })
    })
    .catch(() => {})
})

// GET /api/users/:id/addresses - Gets all addresses of a user by id from the database
router.get('/:id/addresses', async (req, res, next) => {
  const { id } = req.params

  const user = await User.findById(id).populate(
    'addresses.billing addresses.shipping',
  )

  res.status(200).json({
    billing: user.addresses.billing,
    shipping: user.addresses.shipping,
  })
})

// POST /api/users/:id/address/:type - Creates an address for a user in the database depending on the address type
router.post('/:id/address/:type', async (req, res, next) => {
  const { type, id } = req.params

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
      user: id,
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
      await User.findByIdAndUpdate(id, { 'addresses.billing': address._id })
    else if (type === 'shipping')
      await User.findByIdAndUpdate(id, {
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

// PATCH /api/users/:id/address/:type - Updates an address for a user in the database depending on the address type
router.patch('/:id/address/:type', async (req, res, next) => {
  const { type, id } = req.params
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

  console.log(id)

  try {
    const address = await Address.findOneAndUpdate(
      { user: id },
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
      await User.findByIdAndUpdate(id, { 'addresses.billing': address._id })
    else if (type === 'shipping')
      await User.findByIdAndUpdate(id, {
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
