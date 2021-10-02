const router = require('express').Router()
const Category = require('../models/Category.model')
const Product = require('../models/Product.model')
const { isAuthenticated } = require('../middleware/jwt.middleware')

// GET /api/categories - Gets all categories from the database
router.get('/', (_, res, next) => {
  Category.find()
    .then((categories) => {
      res.status(200).json(categories)
    })
    .catch((err) => next(err))
})

//GET /api/categories/search - Finds categories by name
router.get('/search', (req, res, next) => {
  const { query } = req.body

  Category.find({
    name: { $regex: query, $options: 'i' },
  })
    .then((categories) => res.status(200).json(categories))
    .catch((err) => next(err))
})

//GET /api/categories/:id - Gets a category by id from the database
router.get('/:id', (req, res, next) => {
  const { id } = req.params

  Category.findById(id)
    .populate('products')
    .then((category) => {
      res.status(200).json(category)
    })
    .catch((err) => next(err))
})

//POST /api/categories/create - Creates a new category in the database
router.post('/create', isAuthenticated, (req, res, next) => {
  const { name, description } = req.body

  Category.create({ name, description })
    .then((category) =>
      res.status(201).json({
        category,
        message: 'Category created successfully.',
      }),
    )
    .catch((err) => next(err))
})

// PATCH - /api/categories/:id - Edits a category by id from the database
router.patch('/:id', isAuthenticated, (req, res, next) => {
  const { id } = req.params
  const { name, description } = req.body

  Category.findByIdAndUpdate(id, { name, description }, { new: true })
    .then((category) =>
      res
        .status(200)
        .json({ category, message: 'Category updated successfully' }),
    )
    .catch((err) => next(err))
})

/// DELETE - /api/categories/delete/:id - Deletes a category by id from the database if it does not have associated products
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params
  try {
    const product = await Product.find({ category: { $eq: id } })

    if (product.length === 0) {
      await Category.findByIdAndRemove(id)
      res.status(200).json({ message: 'Category deleted successfully' })
    } else {
      res.status(409).json({
        message:
          'There are products associated to this category and it could not be deleted.',
      })
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
