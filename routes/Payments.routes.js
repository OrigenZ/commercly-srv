const router = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

/* POST payment gateway*/
router.post('/', async (req, res, next) => {
  const { amount, id, currency } = req.body
  try {
    await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: id,
      confirm: true,
    })
    res.status(200).json({
      message: 'Payment successfull',
      success: true,
    })
  } catch (err) {
    res.status(200).json({
      message: 'Paymentfailed',
      success: false,
    })
  }
})

module.exports = router
