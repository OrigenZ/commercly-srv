const jwt = require('express-jwt')

// Extracts the JWT token from the request's 'Authorization' Headers
const getTokenFromHeaders = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  }

  return null
}

// Instantiate the JWT token validation middleware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload',
  getToken: getTokenFromHeaders,
})

module.exports = {
  isAuthenticated,
}
