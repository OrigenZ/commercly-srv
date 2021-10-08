const express = require('express')

const logger = require('morgan')
const cors = require('cors')

// Middleware configuration
module.exports = (app) => {
  // To have access to `body` property in the request
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  // Services like heroku use something called a proxy and you need to add this to your server
  app.set('trust proxy', 1)

  // controls a very specific header to pass headers from the frontend
  app.use(
    cors({
      credentials: true,
      // origin: process.env.ORIGIN || 'http://localhost:5005/',
      origin: '*'
    }),
  )
  // In development environment the app logs
  app.use(logger('dev'))
}
