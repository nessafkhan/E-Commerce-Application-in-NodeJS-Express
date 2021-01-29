const { response } = require("express");
var db = require("../config/db_connection");
const objectId = require("mongodb").ObjectID;

module.exports = {
  // TO ADD PRODUCTS
  addProduct: (product, callback) => {
    db.get()
      .collection("products")
      .insertOne(product)
      .then((data) => {
        callback(data.ops[0]._id);
      });
  },

  // TO SHOW ALL PRODUCTS
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection("products").find().toArray();
      resolve(products);
    });
  },

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("products")
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("products")
        .findOne({ _id: objectId(productId) })
        .then((product) => {
          resolve(product);
        });
    });
  },

  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("products")
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              title: productDetails.title,
              price: productDetails.price,
              description: productDetails.description,
            },
          }
        ).then((response)=>{
          resolve()
        })
    });
  },
};
