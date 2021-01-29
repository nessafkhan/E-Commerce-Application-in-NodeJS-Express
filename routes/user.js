const { response } = require("express");
var express = require("express");
var router = express.Router();
const { getAllProducts } = require("../helpers/product_helpers");
const userHelpers = require("../helpers/user_helpers");
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/user_login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount=null
  if(user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  getAllProducts().then((products) => {
    res.render("index", { products, user ,cartCount});
  });
});

router.get("/user_login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/user_login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

router.get("/user_signup", (req, res) => {
  res.render("user/user_signup");
});

router.post("/user_signup", (req, res) => {
  userHelpers.doSignUp(req.body).then((response) => {
    
    req.session.loggedIn = true;
    req.session.user = response.user;
    res.redirect("/");
  });
});

router.post("/user_login", (req, res) => {
  userHelpers.doLogIn(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = "Invalid user name or password!";
      res.redirect("/user_login");
    }
  });
});

router.get("/user_logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get(
  "/cart",
  verifyLogin,
  async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    res.render("user/cart",{products,user:req.session.user});
  },

  router.get("/add_to_cart/:id", (req, res) => {
   
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
     res.json({status:true})
    });
  })
);
router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(()=>{
  })
})
module.exports = router;
