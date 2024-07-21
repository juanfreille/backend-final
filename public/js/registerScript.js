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
          text: "Te has registrado exitosamente!",
        });
        form.reset();
      } else {
        throw new Error(json.message);
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message, // Muestra el mensaje de error específico
      });
      console.error("Error:", error);
    });
});
