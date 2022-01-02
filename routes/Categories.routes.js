const router = require('express').Router()
const Category = require('../models/Category.model')
const Product = require('../models/Product.model')
const { isAuthenticated } = require('../middleware/jwt.middleware')

// GET /api/categories - Gets all categories from the database
router.get('/', async (_, res, next) => {
  try {
    const categories = await Category.find()
    res.status(200).json(categories)
  } catch (err) {
    next(err)
  }
})

//GET /api/categories/search - Finds categories by name
router.get('/search', async (req, res, next) => {
  const { query } = req.body
  try {
    const categories = await Category.find({
      name: { $regex: query, $options: 'i' },
    })
    res.status(200).json(categories)
  } catch (err) {
    next(err)
  }
})

//GET /api/categories/:id - Gets a category by id from the database
router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const category = await Category.findById(id).populate('products')

    res.status(200).json(category)
  } catch (err) {
    next(err)
  }
})

//POST /api/categories/create - Creates a new category in the database
router.post('/create', isAuthenticated, async (req, res, next) => {
  const { name, description } = req.body
  try {
    const category = await Category.create({ name, description })
    res.status(201).json({
      category,
      message: 'Category created successfully.',
    })
  } catch (err) {
    next(err)
  }
})

// PATCH - /api/categories/:id - Edits a category by id from the database
router.patch('/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params
  const { name, description } = req.body
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true },
    )
    res.status(200).json({ category, message: 'Category updated successfully' })
  } catch (err) {
    next(err)
  }
})

/// DELETE - /api/categories/delete/:id - Deletes a category by id from the database if it does not have associated products
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params
  try {
    const product = await Product.find({ category: { $eq: id } })
    if (product.length === 0) {
      await Category.findByIdAndRemove(id)
      res.status(200).json({ message: 'Category deleted successfully' })
      return
    }
    res.status(409).json({
      message:
        'There are products associated to this category and it could not be deleted.',
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
