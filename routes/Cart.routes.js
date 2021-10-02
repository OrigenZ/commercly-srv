const router = require("express").Router();
const User = require("../models/User.model");
const Cart = require("../models/Cart.model");

//GET /api/cart/:customerId - gets a cart from the database
router.get("/:customerId", (req, res, next) => {
  const { customerId } = req.params;

  Cart.findOne({ customer: customerId })
    .populate("products")
    .then((cart) => {
      res.status(200).json(cart);
      console.log(cart);
    })
    .catch((err) => next(err));
});


//POST /api/cart/add-item - Adds an item to the cart
router.post("/add-item", (req, res, next) => {
  const { productId, cartId } = req.body;

  Cart.findOneAndUpdate(
    { _id: cartId },
    {
      $push: { products: { _id: productId } },
    },
    { new: true }
  )
    .populate("products")
    .then((cart) => res.status(200).json(cart))
    .catch((err) => next(err));
});

//POST /api/cart/remove-item - Removes an item from the cart
router.post("/remove-item", async (req, res, next) => {
  const { productId, cartId } = req.body;

  try {
    const cart = await Cart.findById(cartId);

    const prodIndex = cart.products.findIndex(
      (product) => String(product) === productId
    );

    if (prodIndex >= 0) cart.products.splice(prodIndex, 1);

    const newCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        products: cart.products,
      },
      { new: true }
    ).populate("products");

    res.status(200).json(newCart);
  } catch (err) {
    next(err);
  }
});

//POST /api/cart/remove-line - remove product line from cart
router.post("/remove-line", async (req, res, next) => {
  const { productId, cartId } = req.body;

  Cart.findOneAndUpdate(
    { _id: cartId },
    {
      $pull: { products: { $in: [productId] } },
    },
    { new: true }
  )
    .populate("products")
    .then((cart) => res.status(200).json(cart))
    .catch((err) => next(err));
});

module.exports = router;
