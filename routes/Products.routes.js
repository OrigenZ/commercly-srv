const router = require('express').Router()
const multer = require('multer')
const upload = multer({ dest: './public/uploads/' })
const Product = require('../models/Product.model')
const Category = require('../models/Category.model')
const fs = require('fs')

//GET List products
router.get('/', async (_, res, next) => {
  try {
    const products = await Product.find().populate('category')
    const categories = await Category.find()
    res.render('products/products-list', { categories, products })
  } catch (err) {
    next(err)
  }
})

//GET create product
router.get('/create', (_, res, next) => {
  Category.find()
    .then((categories) => {
      res.render('products/new-product', { categories: categories })
    })
    .catch((err) => next(err))
})

//POST create product
router.post('/create', upload.single('image'), async (req, res, next) => {
  const { name, price, description, category, brand } = req.body

  let image
  //req.file.mimetype  image/jpg  image/png
  try {
    if (req.file) {
      image = {
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
      }
    }
    const product = await Product.create({
      name,
      price,
      description,
      category,
      brand,
      image,
    })
    await Category.findByIdAndUpdate(product.category, {
      $push: { products: { _id: product._id } },
    })

    res.redirect('/products')
  } catch (err) {
    next(err)
  }
})

//GET Find product
router.get('/:id', (req, res, next) => {
  const { id } = req.params
  Product.findById(id)
    .populate('category')
    .then((product) => res.render('products/product-details', product))
    .catch((err) => next(err))
})

//GET Find products of category
router.get('/filter/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const category = await Category.findById(id).populate('products')
    const categories = await Category.find()

    res.render('products/products-list', {
      products: category.products,
      categories,
    })
  } catch (err) {
    next(err)
  }
})

//POST Search products by name or brand
router.post('/search', async (req, res, next) => {
  const { query } = req.body
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
      ],
    })
    const categories = await Category.find()

    res.render('products/products-list', {
      products,
      categories,
    })
  } catch (err) {
    next(err)
  }
})

//POST delete product
router.post('/delete/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const product = await Product.findById(id)

    if (product.image.path) {
      const path = __dirname + '/../public' + product.image.path
      fs.unlink(path, (err) => {
        if (err) next(err)
      })
    }

    await Product.deleteOne(product)

    res.redirect('/products')
  } catch (err) {
    next(err)
  }
})

//GET Edit product
router.get('/edit/:id', (req, res, next) => {
  const { id } = req.params

  Promise.all([Product.findById(id), Category.find()])
    .then(([product, categories]) =>
      res.render('products/edit-product', { product, categories }),
    )
    .catch((err) => next(err))
})

//POST edit product
router.post('/edit/:id', upload.single('image'), async (req, res, next) => {
  const { id } = req.params
  const { name, price, description, category, brand } = req.body

  const product = await Product.findById(id)

  try {
    if (req.file) {
      if (product.image.path) {
        const path = __dirname + '/../public' + product.image.path
        fs.unlink(path, (err) => {
          if (err) {
            next(err)
          }
        })
      }
      const image = {
        originalName: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
      }
      await Product.findByIdAndUpdate(id, {
        name,
        price,
        description,
        category,
        brand,
        image,
      })
    } else {
      await Product.findByIdAndUpdate(id, {
        name,
        price,
        description,
        category,
        brand,
      })
    }
    res.redirect(`/products/`)
  } catch (err) {
    next(err)
  }
})

module.exports = router
