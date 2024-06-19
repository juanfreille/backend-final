const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  initializeSocket();
  initializeAddToCartButton();
});

function initializeSocket() {
  socket.on("cartUpdated", updateCartQuantity);
  socket.on("cartId", showSuccessMessage);
  socket.on("cartNotUpdated", showErrorMessage);
}

function initializeAddToCartButton() {
  const addToCartButton = document.getElementById("addToCartBtn");
  addToCartButton.addEventListener("click", addToCart);
}

function addToCart(event) {
  event.preventDefault();
  const addToCartButton = event.target;
  const productId = addToCartButton.dataset.productId;
  const userEmail = document.getElementById("user-email").value;
  const userCartID = document.getElementById("userCartID").value;

  try {
    socket.emit("addToCart", { productId, userEmail, userCartID });
  } catch (error) {
    showErrorMessage("Ocurrió un error al agregar el producto al carrito");
  }
}

function updateCartQuantity(data) {
  const totalQuantityInCart = data.totalQuantityInCart;
  document.getElementById("numeroCarrito").textContent = totalQuantityInCart;
}

function showSuccessMessage(cartId) {
  Swal.fire({
    icon: "success",
    title: "¡Producto agregado al carrito!",
    text: `ID del carrito: ${cartId}`,
    showCancelButton: true,
    confirmButtonText: "Ir al carrito",
    cancelButtonText: "Seguir comprando",
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/cart/${cartId}`;
    }
  });
}

function showErrorMessage(errorMessage) {
  Swal.fire({
    icon: "error",
    title: "¡Error!",
    text: `${errorMessage}`,
    showCancelButton: false,
    confirmButtonText: "OK",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}
