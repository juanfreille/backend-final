const cartItems = document.getElementById("cartItemList");
const cartSummary = document.getElementById("cartSummary");
const vaciarCarritoBtn = document.getElementById("vaciarCarritoBtn");
let subtotal = 0;

if (cartItems) {
  const totalPriceElements = cartItems.querySelectorAll(".totalPrice");
  const quantityElements = cartItems.querySelectorAll(".quantity");

  totalPriceElements.forEach((priceElement, index) => {
    const price = parseFloat(priceElement.closest(".carrito21BoxCol2").querySelector(".price").innerText);
    const quantity = parseInt(quantityElements[index].innerText);
    const totalPrice = price * quantity;
    priceElement.innerText = totalPrice.toFixed(0);
    subtotal += totalPrice;
  });
}

if (cartSummary) {
  const subtotalElement = cartSummary.querySelector("#subtotal");
  const totalElement = cartSummary.querySelector("#total");

  subtotalElement.innerText = `$${subtotal.toFixed(0)}`;
  totalElement.innerText = `$${subtotal.toFixed(0)}`;
}

if (vaciarCarritoBtn) {
  vaciarCarritoBtn.addEventListener("click", async function (event) {
    event.preventDefault();

    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción vaciará tu carrito de compras. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        cancelButton: "vaciar-carrito-cancel btn btn-dark",
        confirmButton: "btn btn-effect btn-dark btn-jif vaciar-carrito-confirm ",
      },
      confirmButtonText: "Sí, vaciar carrito",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("/api/carts/{{ user.cart._id }}", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            window.location.reload();
          } else {
            console.error("Error al vaciar el carrito:", response.statusText);
            Swal.fire({
              icon: "error",
              title: "¡Error!",
              text: "Ocurrió un error al vaciar el carrito",
              allowOutsideClick: false,
              allowEscapeKey: false,
            });
          }
        } catch (error) {
          console.error("Error al vaciar el carrito:", error);
          Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: "Ocurrió un error al vaciar el carrito",
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        }
      }
    });
  });
}
