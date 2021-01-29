const { response } = require("express");
var express = require("express");
const product_helpers = require("../helpers/product_helpers");
var router = express.Router();
var productHelper = require("../helpers/product_helpers");

router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/view_products", { products, admin: true });
  });
});

router.get("/add_products", (req, res) => {
  res.render("admin/add_products", { admin: true });
});

router.post("/add_products", (req, res) => {
  productHelper.addProduct(req.body, (_id) => {
    let image = req.files.image;
    image.mv("./public/product_images/" + _id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add_products");
      }
    });
  });
});

router.get("/delete_product:id", (req, res) => {
  let productId = req.params.id;
  productHelper.deleteProduct(productId).then((response) => {
    res.redirect("/admin/");
  });
});

router.get("/edit_product:id", async (req, res) => {
  let product = await productHelper.getProductDetails(req.params.id);
  res.render("admin/edit_product", { product });
});

router.post("/edit_product:id",(req,res)=>{
  console.log(req.params.id,req.body);
  let id=req.params.id
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect("/admin/")
    if(req.files.image){
      let image=req.files.image;
      image.mv("./public/product_images/" + id + ".jpg")
    }
  })
})

module.exports = router;
