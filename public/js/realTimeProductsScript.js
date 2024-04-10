const socket = io();
const form = document.getElementById("formulario");
const tableBody = document.getElementById("table-body");

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
      product.thumbnails && product.thumbnails.length
        ? "img/" + product.thumbnails[0]
        : "img/noThumbnails.webp"
    }" alt="Thumbnail" class="thumbnail" style="width: 75px;"></td>
    <td><button class="btn btn-effect btn-dark btn-jif bg-black" onClick="deleteProduct('${
      product._id
    }')">Eliminar</button></td>
  `;
  return row;
}

function deleteProduct(productId) {
  const id = productId;
  console.log("ID del producto a eliminar:", id);
  confirmarEliminacionProducto(productId);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("thumbnails");
  const file = fileInput.files[0];

  product = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value,
    price: parseInt(document.getElementById("price").value),
    code: document.getElementById("code").value,
    stock: parseInt(document.getElementById("stock").value),
    thumbnail: file,
  };

  try {
    const newProduct = product;
    console.log(newProduct);
    socket.emit("createProduct", newProduct);

    const cancelButtonContainer = document.getElementById(
      "cancelButtonContainer"
    );
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
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );

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
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );
  cancelButtonContainer.style.display = "none";
}

function showCancelButton() {
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );
  cancelButtonContainer.style.display = "block";
}

function confirmarEliminacionProducto(idProducto) {
  const customAlertConfig = {
    title: "Eliminar producto",
    reverseButtons: true,
    html: "<div class='modal-body'><p>¿Está seguro que desea eliminar producto?</p><p>Esta operación no puede ser revertida.</p></div>",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Sí, eliminar producto",
  };
  customSwalert.fire(customAlertConfig).then((result) => {
    if (result.isConfirmed) {
      const id = idProducto;
      console.log("ID del producto a eliminar:", id);
      socket.emit("deleteProduct", id);
      emptyTable();
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
    }
  });
}

const customSwalert = Swal.mixin({
  customClass: {
    cancelButton: "swal2-deny swal2-styled btn px-5 mt-3 mx-1 btn-secondary",
    confirmButton:
      "swal2-deny swal2-styled btn px-5 mt-3 mx-1 btn-danger btn-delete",
  },
  buttonsStyling: false,
});
