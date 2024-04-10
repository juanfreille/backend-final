document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".btn-detalles").forEach((boton) => {
    boton.addEventListener("click", function () {
      const _id = this.getAttribute("data-id");
      const title = this.getAttribute("data-title");
      const description = this.getAttribute("data-description");
      const category = this.getAttribute("data-category");
      const price = this.getAttribute("data-price");
      const code = this.getAttribute("data-code");
      const stock = this.getAttribute("data-stock");
      const thumbnails = this.getAttribute("data-thumbnails");

      const productoItem = {
        _id: _id,
        title: title,
        description: description,
        category: category,
        price: price,
        code: code,
        stock: stock,
        thumbnails: thumbnails,
      };
      openModal(productoItem);
    });
  });
});

function openModal(productoItem) {
  const { _id, title, description, category, price, code, stock, thumbnails } =
    productoItem;
  const thumbnailSrc = thumbnails
    ? `img/${thumbnails}`
    : "img/noThumbnails.webp";

  document.getElementById("detallesModalLabel").innerHTML = `      


  <div class="modal-content modal-content-mio">
  <div class="modal-header">
    <h1 class="modal-title texto-lg" id="detallesModalLabel">${title}</h1>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>
  <div class="modal-body">
    <div class="row">
      <div class="col-md-6">
      <img src="${thumbnailSrc}" alt="${title}" class="img-fluid">
      </div>
      <div class="col-md-6">
        <p>ID: ${_id}</p>
        <p>Precio: ${price}</p>
        <p>Stock disponible: ${stock}</p>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <p>Descripción: ${description}</p>
        <p>Categoría: ${category}</p>
        <p>Código: ${code}</p>
      </div>
    </div>
  </div>
</div>
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-effect btn-dark btn-jif bg-black" data-bs-dismiss="modal">Cerrar</button>
  </div>
</div>
  `;

  $("#detallesModal").modal("show");
}
