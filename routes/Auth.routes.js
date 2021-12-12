const router = require('express').Router()

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isAuthenticated } = require('./../middleware/jwt.middleware.js')

const User = require('../models/User.model')
const Cart = require('../models/Cart.model')

const saltRounds = 10

// POST /auth/signup  - Creates a new user in the database
router.post('/signup', async (req, res, next) => {
  const { email, password, adminToken } = req.body

  if (!email || !password) {
    res.status(400).json({ message: 'Provide email and password' })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Please provide a valid email address.' })
    return
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.',
    })
    return
  }

  try {
    const foundUser = await User.findOne({ email })

    if (foundUser) {
      res.status(409).send('This email is already in use')
      return
    }

    const salt = bcryptjs.genSaltSync(saltRounds)
    const hashedPassword = bcryptjs.hashSync(password, salt)

    let username = email.substring(0, email.indexOf('@'))
    username = username.charAt(0).toUpperCase() + username.slice(1)

    const adminStatus = adminToken === process.env.ADMIN_TOKEN ? true : false

    const createdUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin: adminStatus,
    })
    const cart = await Cart.create({ customer: createdUser._id })

    const user = await User.findByIdAndUpdate(
      createdUser._id,
      { cart: cart._id },
      { new: true },
    )
    user.password = undefined

    res.status(201).json({ user: user })
  } catch (err) {
    next(err)
  }
})

// POST /auth/login - Verifies email and password and returns a JWT
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(401).json({ message: 'Provide email and password.' })
    return
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).send('Credentials are not valid')
      return
    }

    const passwordCorrect = await bcryptjs.compare(password, user.password)
    if (passwordCorrect) {
      const { _id, isAdmin } = user
      const payload = {
        _id,
        isAdmin,
      }

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: '6h',
      })
      res.status(200).json({ authToken: authToken })
      return
    }
    res.status(401).send('Credentials are not valid')
  } catch (err) {
    next(err)
  }
})

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload)

  res.status(200).json(req.payload)
})
//

module.exports = router
