document.addEventListener("DOMContentLoaded", function () {
  const pathParts = window.location.pathname.split("/");
  const code = pathParts[pathParts.length - 1];

  console.log(code);

  if (code) {
    document.getElementById("code").value = code;
  }
  const newPasswordForm = document.getElementById("newpassword-form");

  if (newPasswordForm) {
    newPasswordForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const code = document.getElementById("code").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm_password").value;

      if (password !== confirmPassword) {
        Toastify({
          text: "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
          style: {
            background: "linear-gradient(to right, #ff5f6d, #ffc371)",
          },
          duration: 3000,
        }).showToast();
        return;
      }

      fetch("/api/sessions/newpassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            Toastify({
              text: "Contraseña actualizada con éxito, redirigiendo al login",
              style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
              duration: 3000,
            }).showToast();
            setTimeout(() => {
              window.location.replace("/login");
            }, 3100);
          } else {
            Toastify({
              text: data.message,
              style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
              },
              duration: 3000,
            }).showToast();
          }
        })
        .catch((error) => {
          Toastify({
            text: "Ocurrió un error. Por favor, inténtalo de nuevo.",
            style: {
              background: "linear-gradient(to right, #ff5f6d, #ffc371)",
            },
            duration: 3000,
          }).showToast();
        });
    });
  }
});
