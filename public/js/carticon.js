/* =====================
    renew stock in cart
   ===================== */

function renewCartIcon() {
  const count = document.getElementsByClassName('count');
  const allProductsInCart = JSON.parse(localStorage.getItem('stylishCart')) || [];
  for (let i = 0; i < count.length; i++) {
    count[i].innerHTML = allProductsInCart.length;
  }
}

renewCartIcon();
