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

socket.on("products", (data) => {
  console.log("Lista de productos recibida del servidor:", data);
  emptyTable();
  showProducts(data);
});

function createTableRow(product) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${product.id}</td>
    <td class="text-nowrap">${product.title}</td>
    <td>${product.description}</td>
    <td class="text-nowrap">$ ${product.price}</td>
    <td>${product.category}</td>
    <td>${product.stock}</td>
    <td>${product.code}</td>
    <td><img src="${product.thumbnails[0]}" alt="Thumbnail" class="thumbnail" style="width: 75px;"></td>
    <td><button class="btn btn-effect btn-dark btn-jif bg-black" onClick="deleteProduct('${product.id}')">Eliminar</button></td>
  `;
  return row;
}

function deleteProduct(productId) {
  const id = parseInt(productId);
  console.log("ID del producto a eliminar:", id);
  emptyTable();
  socket.emit("delete", id);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const price = parseFloat(document.getElementById("price").value);
  const stock = parseInt(document.getElementById("stock").value);
  const fileInput = document.getElementById("thumbnails");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("description", document.getElementById("description").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("price", price);
  formData.append("code", document.getElementById("code").value);
  formData.append("stock", stock);
  formData.append("thumbnails", file);

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al agregar el producto");
    }

    const newProduct = await response.json();

    socket.emit("add", newProduct);
    const cancelButtonContainer = document.getElementById(
      "cancelButtonContainer"
    );
    cancelButtonContainer.style.display = "none";
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
