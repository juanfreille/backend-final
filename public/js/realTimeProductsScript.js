const socket = io();
const form = document.getElementById("formulario");
const tableBody = document.getElementById("table-body");
let userRole = document.getElementById("user-role").textContent;
let userId = document.getElementById("user-id").textContent;
function getProducts() {
  socket.emit("getProducts", (products) => {
    emptyTable();
    showProducts(products);
  });
}

function emptyTable() {
  tableBody.innerHTML = "";
}

function showProducts(products) {
  products.forEach((product) => {
    const row = createTableRow(product);
    tableBody.appendChild(row);
  });
}

socket.on("products", (products) => {
  emptyTable();
  showProducts(products);
});

function createTableRow(product) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${product._id}</td>
    <td class="text-nowrap">${product.title}</td>
    <td>${product.description}</td>
    <td class="text-nowrap">$ ${product.price}</td>
    <td>${product.category}</td>
    <td>${product.stock}</td>
    <td>${product.code}</td>
    <td><img src="${
      product.thumbnails && product.thumbnails.length ? "img/products/" + product.thumbnails[0] : "img/products/noThumbnails.webp"
    }" alt="Thumbnail" class="thumbnail" style="width: 75px;"></td>
    <td style="text-align: center">${product.ownerName}</td>
    <td><button class="btn btn-effect btn-dark btn-jif bg-black" onClick="deleteProduct('${product._id}', '${product.owner}')">Eliminar</button></td>
  `;
  return row;
}

function deleteProduct(productId, productOwner) {
  if (userRole === "admin" || userId === productOwner) {
    confirmarEliminacionProducto(productId, userRole, userId);
  } else {
    Toastify({
      text: "No tienes permiso para eliminar este producto",
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: "#d9534f",
      },
      stopOnFocus: true,
    }).showToast();
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  let formData = new FormData(form);

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Error en la carga del producto");

    const newProduct = await response.json();
    socket.emit("createProduct", newProduct);
    const cancelButtonContainer = document.getElementById("cancelButtonContainer");
    cancelButtonContainer.style.display = "none";
    Toastify({
      text: `Producto agregado exitosamente`,
      duration: 3000,
      gravity: "top",
      position: "right",
      avatar: "../img/check-mark.png",
      style: {
        background: "#96c93d",
      },
      stopOnFocus: true,
    }).showToast();
  } catch (error) {
    console.error("Error al agregar el producto:", error);
  }

  form.reset();
  imagePreview.innerHTML = "";
});

function previewImage() {
  const fileInput = document.getElementById("thumbnails");
  const imagePreview = document.getElementById("imagePreview");
  const cancelButtonContainer = document.getElementById("cancelButtonContainer");

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const image = document.createElement("img");
      image.src = event.target.result;
      image.style.maxWidth = "200px";
      image.style.maxHeight = "200px";

      imagePreview.innerHTML = "";
      imagePreview.appendChild(image);
      cancelButtonContainer.innerHTML = `<button class="btn btn-danger" style="padding: 0.2rem 0.4rem;border-radius: 50%;margin: 0.4rem;font-size: 1.5em;" onclick="cancelImageSelection()"><i class="fa fa-close" id="btnCerrar" aria-hidden="true"></i></button>`;
    };
    reader.readAsDataURL(fileInput.files[0]);
    showCancelButton();
  } else {
    imagePreview.innerHTML = "";
    cancelButtonContainer.innerHTML = "";
    hideCancelButton();
  }
}
function cancelImageSelection() {
  const fileInput = document.getElementById("thumbnails");
  fileInput.value = "";
  const imagePreview = document.getElementById("imagePreview");
  imagePreview.innerHTML = "";
  cancelButtonContainer.innerHTML = "";
}

function hideCancelButton() {
  const cancelButtonContainer = document.getElementById("cancelButtonContainer");
  cancelButtonContainer.style.display = "none";
}

function showCancelButton() {
  const cancelButtonContainer = document.getElementById("cancelButtonContainer");
  cancelButtonContainer.style.display = "block";
}

function confirmarEliminacionProducto(idProducto, userRole, userId) {
  const customAlertConfig = {
    title: "Eliminar producto",
    reverseButtons: true,
    html: "<div class='modal-body'><p>¿Está seguro que desea eliminar producto?</p><p>Esta operación no puede ser revertida.</p></div>",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Sí, eliminar producto",
  };
  customSwalert.fire(customAlertConfig).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/products/${idProducto}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al eliminar el producto");
        }
        Toastify({
          text: "Producto eliminado exitosamente",
          duration: 3000,
          gravity: "top",
          position: "right",
          avatar: "../img/check-mark.png",
          style: {
            background: "#96c93d",
          },
          stopOnFocus: true,
        }).showToast();

        // Actualizar la tabla de productos
        getProducts();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        Toastify({
          text: "Error al eliminar el producto",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#d9534f",
          },
          stopOnFocus: true,
        }).showToast();
      }
    }
  });
}

const customSwalert = Swal.mixin({
  customClass: {
    cancelButton: "swal2-deny swal2-styled btn px-5 mt-3 mx-1 btn-secondary",
    confirmButton: "swal2-deny swal2-styled btn px-5 mt-3 mx-1 btn-danger btn-delete",
  },
  buttonsStyling: false,
});
