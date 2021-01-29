var db = require("../config/db_connection");
const bcrypt = require("bcrypt");
const { response } = require("express");
const objectId = require("mongodb").ObjectID;

module.exports = {
  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get()
        .collection("users")
        .insertOne(userData)
        .then((data) => {
          resolve(data[0]);
        });
    });
  },

  doLogIn: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loggedIn = false;
      let response = {};
      let user = await db
        .get()
        .collection("users")
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
            console.log("login success");
          } else {
            resolve({ status: false });
            console.log("login failed");
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  addToCart: (productId, userId) => {
    let proObj = {
      item: objectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection("cart")
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == productId
        );
        if (proExist != -1) {
          db.get()
            .collection("cart")
            .updateOne(
              {
                user: objectId(userId),
                "products.item": objectId(productId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection("cart")
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        cartObject = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection("cart")
          .insertOne(cartObject)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection("cart")
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(cartItems);
    });
  },
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection("cart")
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (details) => {
    let count = parseInt(details.count);
    return new Promise((resolve, reject) => {
      db.get()
        .collection("cart")
        .updateOne(
          {
            _id: objectId(details.cart),
            "products.item": objectId(details.product),
          },
          {
            $inc: { "products.$.quantity": count },
          }
        )
        .then((response) => {
          console.log("procount", response);
          resolve(response);
        });
    });
  }
};
