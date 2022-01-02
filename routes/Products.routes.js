const router = require('express').Router()
const Product = require('../models/Product.model')
const Category = require('../models/Category.model')
const fileUploader = require('../config/cloudinary.config')
const { isAuthenticated } = require('../middleware/jwt.middleware')

//GET /api/products - Gets all products from the database
router.get('/', async (_, res, next) => {
  try {
    const products = await Product.find().populate('category')
    res.status(200).json({ products })
  } catch (err) {
    next(err)
  }
})

//GET /api/products/:id - Gets a product by id from the database
router.get('/:id', async (req, res, next) => {
  const { id } = req.params
  try {
    const product = await Product.findById(id).populate('category')
    res.status(200).json(product)
  } catch (err) {
    next(err)
  }
})

// POST /api/products/create  - Creates a new product in the database
router.post(
  '/create',
  isAuthenticated,
  fileUploader.single('imageUrl'),
  async (req, res, next) => {
    const {
      sku,
      name,
      price,
      tax,
      description,
      category,
      brand,
      quantity,
    } = req.body

    const totalPrice =
      parseInt(price) + (parseInt(price) * parseFloat(tax)) / 100

    const imageUrl = req.file ? req.file.path : null

    try {
      const product = await Product.create({
        sku,
        name,
        price,
        totalPrice,
        tax,
        description,
        category,
        brand,
        quantity,
        imageUrl,
      })

      await Category.findByIdAndUpdate(product.category, {
        $push: { products: { _id: product._id } },
      })

      res.status(201).json({ product, message: 'Product created successfully' })
    } catch (err) {
      next(err)
    }
  },
)

// PATCH - /api/products/:id - Edits a product by id from the database
router.patch(
  '/:id',
  isAuthenticated,
  fileUploader.single('imageUrl'),
  async (req, res, next) => {
    const { id } = req.params
    const {
      sku,
      quantity,
      name,
      price,
      tax,
      description,
      category,
      brand,
    } = req.body

    const totalPrice =
      parseInt(price) + (parseInt(price) * parseFloat(tax)) / 100
    const imageUrl = req.file ? req.file.path : null

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        {
          sku,
          quantity,
          name,
          price,
          tax,
          description,
          category,
          brand,
          totalPrice,
          imageUrl,
        },
        { new: true },
      )
      res.status(200).json({ product, message: 'Product updated successfully' })
    } catch (err) {
      next(err)
    }
  },
)

// DELETE - /api/products/:id - Deletes a product by id from the database
router.delete('/:id', isAuthenticated, async (req, res, next) => {
  const { id } = req.params

  try {
    const product = await Product.findById(id)

    await Category.findOneAndUpdate(product.category, {
      $pull: { products: { $in: [product._id] } },
    })

    await Product.deleteOne(product)

    res.status(200).json({ message: 'Product deleted succesfully' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
