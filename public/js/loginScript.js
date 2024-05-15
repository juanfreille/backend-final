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
});
