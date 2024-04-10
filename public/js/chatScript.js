const socket = io();
const chatBox = document.getElementById("chat-message");
const messagesLogs = document.getElementById("messages-history");
const userDbHTML = document.getElementById("usersDB");
const sendButton = document.getElementById("send-button");
let user;
let currentUser;
const userColors = {};

Swal.fire({
  title: "¡Bienvenido al Chat!",
  text: "Por favor, ingresa tu email para comenzar a chatear:",
  iconHtml: '<img src="../img/chat.png">',
  input: "email",
  allowOutsideClick: false,
  allowEscapeKey: false,
  inputValidator: validateEmail,
}).then(handleEmailConfirmation);

function handleEmailConfirmation(result) {
  if (!result.isConfirmed) {
    showEmailPrompt();
  }
}

function showEmailPrompt() {
  Swal.fire({
    title: "¡Bienvenido al Chat!",
    text: "Por favor, ingresa tu email para comenzar a chatear:",
    iconHtml: '<img src="../img/chat.png">',
    input: "email",
    inputValidator: validateEmail,
    allowOutsideClick: false,
    allowEscapeKey: false,
  });
}

function validateEmail(value) {
  if (!value) {
    return "Debes ingresar un email";
  } else if (!/\S+@\S+\.\S+/.test(value)) {
    return "Debes ingresar un email válido";
  }
  const email = value;
  currentUser = email;
  socket.emit("registerEmail", email); // Enviar email al servidor
}

socket.on("registerResponse", (response) => {
  if (response.success) {
    user = response.email; // Asignar el email al usuario
    console.log(`Tu nombre de usuario es ${user}`);
    socket.emit("userConnect", user); // Emitir evento de conexión con el email
  } else {
    showErrorMessage(response.message);
  }
});

function showErrorMessage(errorMessage) {
  Swal.fire({
    icon: "error",
    text: errorMessage,
  }).then(() => {
    showEmailPrompt();
  });
}

sendButton.addEventListener("click", sendMessage);
chatBox.addEventListener("keypress", handleEnterPress);

socket.on("messagesLogs", loadOldMessages);

socket.on("newUser", (data) => {
  swal.fire({
    text: `${data} se ha unido al chat`,
    toast: true,
    position: "top-right",
  });
});

const listUsers = (users = []) => {
  let usersHtml = "";
  users.forEach(({ id, name }) => {
    usersHtml += `
      <li>
        <p>
          <p class="text-success">${name}</p>
        </p>
      </li>
    `;
  });

  userDbHTML.innerHTML = usersHtml;
};

socket.on("activ-user", listUsers);

socket.on("updateUserList", (users) => {
  listUsers(users); // Actualizar la lista de usuarios en la interfaz
});

function sendMessage() {
  const message = chatBox.value.trim();
  if (message !== "") {
    socket.emit("message", {
      user,
      message: chatBox.value,
    });
    chatBox.value = "";
  }
}

function generateMessageElement(user, message) {
  const userColor = getUserColor(user);
  const messageElement = document.createElement("div");
  messageElement.classList.add("message-container");
  messageElement.classList.add(user === currentUser ? "right" : "left");
  messageElement.innerHTML = `
    <div class="chat-avatar">
      <img style="width: 10%;border-radius: 50%;" src="https://icon-library.com/images/unknown-person-icon/unknown-person-icon-4.jpg" alt="">
    </div>
    <p style="color: ${userColor};width: -webkit-fill-available;">${user}:</p>
    <p>${message}</p>`;
  return messageElement;
}

function getUserColor(user) {
  const colors = [
    "#7fdfd4",
    "#16A085",
    "#2ECC71",
    "#27AE60",
    "#3498DB",
    "#441656",
    "#34495E",
    "#F1C40F",
    "#E67E22",
    "#D35400",
    "#E74C3C",
    "#C0392B",
    "#06cf9c", // emerald
    "#007bfc", // cobalt
    "#d42a66", // pink
    "#ea0038", // red
    "#fa6533", // orange
    "#ffbc38", // yellow
    "#25d366", // green
    "#028377", // teal
    "#009de2", // sky-blue
    "#5e47de", // purple
  ];

  return (
    userColors[user] ||
    (userColors[user] = colors[Math.floor(Math.random() * colors.length)])
  );
}

function handleEnterPress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

function loadOldMessages(data) {
  messagesLogs.innerHTML = "";
  data.forEach(({ user, message }) => {
    const messageElement = generateMessageElement(user, message);
    messagesLogs.appendChild(messageElement);
    messagesLogs.scrollTop = messagesLogs.scrollHeight;
  });
}
