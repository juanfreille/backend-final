const socket = io();
const chatBox = document.getElementById("chat-message");
const messagesLogs = document.getElementById("messages-history");
const userDbHTML = document.getElementById("usersDB");
const sendButton = document.getElementById("send-button");
const joinButton = document.getElementById("joinButton");
const leaveButton = document.getElementById("leaveButton");

let currentUser;
let userColors = {};
chatBox.disabled = true;
sendButton.disabled = true;
joinButton.addEventListener("click", joinChat);
leaveButton.addEventListener("click", leaveChat);

socket.on("registerResponse", handleRegisterResponse);
socket.on("newUser", handleNewUser);
socket.on("updateUserList", updateUserList);
socket.on("messagesLogs", loadOldMessages);

sendButton.addEventListener("click", sendMessage);
chatBox.addEventListener("keypress", handleEnterPress);

function joinChat() {
  connectSocket();
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
      chatBox.disabled = false;
      sendButton.disabled = false;
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
  chatBox.disabled = true;
  sendButton.disabled = true;
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
    usersHtml += `<li style="color:green;font-size: 18px;"><p class="text-white">${name}</p></li>`;
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

  const horizontalAlignment = user === currentUser ? "right" : "left";
  messageElement.classList.add(horizontalAlignment);
  const horizontalClass =
    horizontalAlignment === "right" ? "far-right" : "far-left";

  messageElement.innerHTML = `
    <div class="chat-avatar">
      <img style="border-radius: 50%;" src="../img/user_1.jpg" alt="">
    </div>
    <div class="message-body ${horizontalClass}">
      <p style="color: ${userColor};width: -webkit-fill-available;">${user}</p>
      <span class="message-body-span">${message}</span>
    </div>`;

  return messageElement;
}

function getUserColor(user) {
  if (userColors.hasOwnProperty(user)) {
    return userColors[user];
  } else {
    userColors[user] = getRandomColor();
    return userColors[user];
  }
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
