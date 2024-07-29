document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const failLogin = urlParams.get("failLogin");
  const errorMessage = document.getElementById("errorMessage");

  if (failLogin && errorMessage) {
    Toastify({
      text: errorMessage.value,
      duration: 3200,
      gravity: "bottom",
      position: "right",
      close: false,
      style: {
        textAlign: "center",
        background: "#b14040",
      },
    }).showToast();
  }

  document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/sessions/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Toastify({
          text: result.message || "Logueo exitoso!",
          duration: 1200,
          gravity: "bottom",
          position: "right",
          close: false,
          style: {
            textAlign: "center",
            background: "#96c93d",
          },
        }).showToast();

        setTimeout(() => {
          window.location.replace("/home");
        }, 1300);
      } else {
        Toastify({
          text: result.error || "Ocurrió un error al loguearse, verifique sus datos",
          duration: 3200,
          gravity: "bottom",
          position: "right",
          close: false,
          style: {
            textAlign: "center",
            background: "#b14040",
          },
        }).showToast();
      }
    } catch (error) {
      console.error("Error during login:", error);
      Toastify({
        text: "Ocurrió un error al loguearse, verifique sus datos",
        duration: 3200,
        gravity: "bottom",
        position: "right",
        close: false,
        style: {
          textAlign: "center",
          background: "#b14040",
        },
      }).showToast();
    }
  });
});
