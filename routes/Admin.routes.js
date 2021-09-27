const router = require('express').Router()

//GET Admin dashboard
router.get('/', (req, res, next) => {
  res.render('account/admin/dashboard', {
    username: req.session.currentUser.username,
  })
})

module.exports = router

//Extract to REACT
