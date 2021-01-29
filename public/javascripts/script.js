function addToCart(proId) {
  console.log("add cart starts");
  $.ajax({
    url: "/add_to_cart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
          let count=$('#cart-count').html
          count=parseInt(count)+1
          $('#cart-count').html(count)
      }
    },
  });
}

function changeQuantity(cartId, proId, count) {
  $.ajax({
      url: '/change-product-quantity',
      data: {
          cart: cartId,
          product: proId,
          count: count
      },
      method: 'post',
      success: (response) => {
          alert(response)
      }
  })}

