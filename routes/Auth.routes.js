const router = require('express').Router()

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isAuthenticated } = require('./../middleware/jwt.middleware.js')

const User = require('../models/User.model')
const Cart = require('../models/Cart.model')

const saltRounds = 10

// POST /auth/signup  - Creates a new user in the database
router.post('/signup', (req, res, next) => {
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

  User.findOne({ email })
    .then(async (foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: 'User already exists.' })
        return
      }
      const salt = bcryptjs.genSaltSync(saltRounds)
      const hashedPassword = bcryptjs.hashSync(password, salt)

      let username = email.substring(0, email.indexOf('@'))
      username = username.charAt(0).toUpperCase() + username.slice(1)

      if (adminToken === process.env.ADMIN_TOKEN) {
        return User.create({
          username,
          email,
          password: hashedPassword,
          isAdmin: true,
        })
      } else {
        return User.create({
          username,
          email,
          password: hashedPassword,
          isAdmin: false,
        })
      }
    })
    .then(async (user) => {
      const cart = await Cart.create({ customer: user._id })

      const newUser = await User.findByIdAndUpdate(
        user._id,
        { cart: cart._id },
        { new: true },
      )
      newUser.password = undefined

      res.status(201).json({ user: newUser })
    })
    .catch((err) => next(err))
})

// POST /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ message: 'Provide email and password.' })
    return
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: 'User not found.' })
        return
      }
      const passwordCorrect = bcryptjs.compareSync(password, user.password)

      if (passwordCorrect) {
        user.password = undefined

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
      } else {
        res.status(401).json({ message: 'Unable to authenticate the user' })
      }
    })
    .catch((err) => next(err))
})

// GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload)

  res.status(200).json(req.payload)
})
//

module.exports = router
