const router = require('express').Router()
// const multer = require('multer')
// const upload = multer({ dest: './public/uploads/' })
const Product = require('../models/Product.model')
const Category = require('../models/Category.model')

const fileUploader = require('../config/cloudinary.config')

//GET /products - Gets all products from the database
router.get('/', (_, res, next) => {
  Product.find()
    .populate('category')
    .then((products) => res.status(200).json({ products }))
    .catch((err) => next(err))
})

//GET /products/search - Finds products by name or brand from the database
router.get('/search', (req, res, next) => {
  const { query } = req.body

  Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } },
    ],
  })
    .then((products) => {
      res.status(200).json(products)
    })
    .catch((err) => {
      next(err)
    })
})

//GET /products/:id - Gets a product by id from the database
router.get('/:id', (req, res, next) => {
  const { id } = req.params
  Product.findById(id)
    .populate('category')
    .then((product) => res.status(200).json(product))
    .catch((err) => next(err))
})

// GET /products/filter/:id - Finds products by category in the database
router.get('/filter/:id', (req, res, next) => {
  const { id } = req.params

  Category.findById(id)
    .populate('products')
    .then((category) => {
      res.status(200).json({
        products: category.products,
      })
    })
    .catch((err) => next(err))
})

// POST /products/create  - Creates a new product in the database
router.post(
  '/create',
  fileUploader.single('imageUrl'),
  async (req, res, next) => {
    const { name, price, description, category, brand } = req.body
    const imageUrl = req.file.path

    try {
      const newProduct = await Product.create({
        name,
        price,
        description,
        category,
        brand,
        imageUrl,
      })

      await Category.findByIdAndUpdate(newProduct.category, {
        $push: { products: { _id: newProduct._id } },
      })

      res.status(200).json(newProduct)
    } catch (err) {
      next(err)
    }
  },
)

// PATCH - /products/:id - Edits a product from the database
router.patch(
  '/:id',
  fileUploader.single('imageUrl'),
  async (req, res, next) => {
    const { id } = req.params
    const { name, price, description, category, brand } = req.body
    let imageUrl

    if (req.file) imageUrl = req.file.path

    await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        category,
        brand,
        imageUrl,
      },
      { new: true },
    )
      .then((editedProduct) => res.status(200).json(editedProduct))
      .catch((err) => next(err))
  },
)

// DELETE - /products/delete/:id deletes a product from the database
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const product = await Product.findById(id)

    await Category.findOneAndUpdate(product.category, {
      $pull: { products: { $in: [product._id] } },
    })

    await Product.deleteOne(product)

    res.status(204).json({ message: 'Product deleted succesfully' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
