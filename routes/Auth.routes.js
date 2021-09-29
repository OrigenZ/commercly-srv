const router = require('express').Router()
const mongoose = require('mongoose')

const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { isAuthenticated } = require('./../middleware/jwt.middleware.js')

const User = require('../models/User.model')
const Cart = require('../models/Cart.model')

const saltRounds = 10

//GET USER DASHBOARD

/*{ user: req.session.currentUser }*/

// POST /auth/signup  - Creates a new user in the database
router.post('/signup', (req, res, next) => {
  const { email, password } = req.body

  // Check if email or password or name are provided as empty string
  if (!email || !password) {
    res.status(400).json({ message: 'Provide email and password' })
    return
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (!emailRegex.test(email)) {
    res.status(400).json({ message: 'Provide a valid email address.' })
    return
  }

  // Use regex to validate the password format
  // comprobar la contraseña directamente encriptada desde el front
  // TODO: checkear
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/

  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.',
    })
    return
  }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: 'User already exists.' })
        return
      }

      // If email is unique, proceed to hash the password
      const salt = bcryptjs.genSaltSync(saltRounds)
      const hashedPassword = bcryptjs.hashSync(password, salt)

      // Create the new user in the database
      // We return a pending promise, which allows us to chain another `then`

      //Take the first part of the email to use as predefined username
      let username = email.substring(0, email.indexOf('@'))
      username = username.charAt(0).toUpperCase() + username.slice(1)

      return User.create({ email, password: hashedPassword, username })
    })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, username, _id } = createdUser

      // Create a new object that doesn't expose the password
      const user = { email, username, _id }

      // Send a json response containing the user object
      res.status(201).json({ user: user })
    })

    .catch((err) => {
      console.log(err)

      res.status(500).json({ message: 'Internal Server Error' })
    })
})

// #endregion

// #region POST  /auth/login - Verifies email and password and returns a JWT
router.post('/login', (req, res, next) => {
  const { email, password } = req.body

  // Check if email or password are provided as empty string

  if (!email || !password) {
    res.status(400).json({ message: 'Provide email and password.' })
    return
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: 'User not found.' })
        return
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcryptjs.compareSync(password, foundUser.password)

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, username } = foundUser

        // Create an object that will be set as the token payload
        const payload = { _id, email, username }

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: '6h',
        })
        // Send the token as the response
        res.status(200).json({ authToken: authToken })
      } else {
        res.status(401).json({ message: 'Unable to authenticate the user' })
      }
    })
    .catch((err) => res.status(500).json({ message: 'Internal Server Error' }))
})
// #endregion

// #region GET  /auth/verify  -  Used to verify JWT stored on the client
router.get('/verify', isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`

  console.log(`req.payload`, req.payload)

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.payload)
})
// #endregion

module.exports = router
