const socket = io();
const chatBox = document.getElementById("chat-message");
const messagesLogs = document.getElementById("messages-history");
const userDbHTML = document.getElementById("usersDB");
const sendButton = document.getElementById("send-button");
const joinButton = document.getElementById("joinButton");
const leaveButton = document.getElementById("leaveButton");

let currentUser;
let userColors = {};

joinButton.addEventListener("click", joinChat);
leaveButton.addEventListener("click", leaveChat);

socket.on("registerResponse", handleRegisterResponse);
socket.on("newUser", handleNewUser);
socket.on("updateUserList", updateUserList);
socket.on("messagesLogs", loadOldMessages);

sendButton.addEventListener("click", sendMessage);
chatBox.addEventListener("keypress", handleEnterPress);

function joinChat() {
  connectSocket(); // Conectar el socket
  Swal.fire({
    title: "¡Bienvenido al Chat!",
    text: "Por favor, ingresa tu email para comenzar a chatear:",
    iconHtml: '<img src="../img/chat.png">',
    input: "email",
    inputValidator: validateEmail,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Unirse",
  }).then((result) => {
    if (result.isConfirmed) {
      const email = result.value;
      currentUser = email;
      socket.emit("registerEmail", email);
    }
  });
}

function validateEmail(value) {
  if (!value) {
    return "Debes ingresar un email";
  } else if (!/\S+@\S+\.\S+/.test(value)) {
    return "Debes ingresar un email válido";
  }
}

function leaveChat() {
  disconnectSocket();
  joinButton.style.display = "block";
  leaveButton.style.display = "none";
  userDbHTML.innerHTML = "";
}

function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

function handleRegisterResponse(response) {
  if (response.success) {
    user = response.email;
    console.log(`Tu email es ${user}`);
    socket.emit("userConnect", user);
    joinButton.style.display = "none";
    leaveButton.style.display = "block";
  } else {
    showErrorMessage(response.message);
  }
}

function handleNewUser(data) {
  Swal.fire({
    text: `${data}`,
    toast: true,
    position: "top-right",
  });
}

function updateUserList(users) {
  let usersHtml = "";
  users.forEach(({ id, name }) => {
    usersHtml += `<li><p class="text-success">${name}</p></li>`;
  });
  userDbHTML.innerHTML = usersHtml;
}

function sendMessage() {
  const message = chatBox.value.trim();
  if (message !== "") {
    socket.emit("message", { user: currentUser, message });
    chatBox.value = "";
  }
}

function showErrorMessage(errorMessage) {
  Swal.fire({
    icon: "error",
    text: errorMessage,
  });
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
    "#06cf9c",
    "#007bfc",
    "#d42a66",
    "#ea0038",
    "#fa6533",
    "#ffbc38",
    "#25d366",
    "#028377",
    "#009de2",
    "#5e47de",
  ];

  return (
    userColors[user] ||
    (userColors[user] = colors[Math.floor(Math.random() * colors.length)])
  );
}
