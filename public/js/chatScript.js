let socket = io();
const chatBox = document.getElementById("chat-message");
const messagesLogs = document.getElementById("messages-history");
const userDbHTML = document.getElementById("usersDB");
const sendButton = document.getElementById("send-button");
const joinButton = document.getElementById("joinButton");
const leaveButton = document.getElementById("leaveButton");
const currentUser = document.getElementById("user").value;

let userColors = {};
chatBox.disabled = true;
sendButton.disabled = true;
joinButton.addEventListener("click", joinChat);
leaveButton.addEventListener("click", leaveChat);

socket.on("newUser", handleNewUser);
socket.on("updateUserList", updateUserList);
socket.on("messagesLogs", loadOldMessages);

sendButton.addEventListener("click", sendMessage);
chatBox.addEventListener("keypress", handleEnterPress);

function joinChat() {
  socket.emit("joinChat", currentUser);
  chatBox.disabled = false;
  sendButton.disabled = false;
  socket.emit("userConnect", currentUser);
  joinButton.style.display = "none";
  leaveButton.style.display = "block";
}

function leaveChat() {
  joinButton.style.display = "block";
  leaveButton.style.display = "none";
  userDbHTML.innerHTML = "";
  messagesLogs.innerHTML = "";
  chatBox.disabled = true;
  sendButton.disabled = true;
  location.reload();
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
  const horizontalClass = horizontalAlignment === "right" ? "far-right" : "far-left";

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
