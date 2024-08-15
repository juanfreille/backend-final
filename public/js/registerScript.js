window.onload = function () {
  var myModal = new bootstrap.Modal(document.getElementById("registroModal"), {
    backdrop: "static",
    keyboard: false,
  });
  myModal.show();
};

const form = document.getElementById("registerForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));

  fetch("/api/sessions/register", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      if (!result.ok) {
        return result.json().then((json) => {
          throw new Error(json.message);
        });
      }
      return result.json();
    })
    .then((json) => {
      if (json.status === "success") {
        Swal.fire({
          icon: "success",
          title: "¡Registrado exitosamente!",
          text: "Tu cuenta ha sido creada con éxito!",
          showCancelButton: true,
          reverseButtons: true,
          confirmButtonText: "Loguearse",
          cancelButtonText: "Atrás",
          customClass: {
            cancelButton: "btn btn-primary btn-dark widthEm mx-2",
            confirmButton: "btn btn-primary btn-signIn widthEm mx-2",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          } else {
            form.reset();
          }
        });
      } else {
        throw new Error(json.message);
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
      console.error("Error:", error);
    });
});
