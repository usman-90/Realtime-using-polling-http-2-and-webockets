const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  await fetch("/msgs", options);
}

async function getNewMsgs() {

  let reader;
  const utf_decoder = new TextDecoder("utf-8")
  
  try {
  
    const res = await fetch('/msgs')
    reader = res.body.getReader()
  } catch (error) {
    
    console.log("ops error " + error)
    presence.innerText = "🔴"
    
  }
  
  presence.innerText = "🟢"
  
  let done;
  do {
    let readerResponse;
    try {
      readerResponse = await reader.read();
    } catch (e) {
      console.error("reader failed", e);
      presence.innerText = "🔴";
      return;
    }
    done = readerResponse.done;
    const chunk = utf_decoder.decode(readerResponse.value, { stream: true });
    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render();
      } catch (e) {
        console.error("parse error", e);
      }
    }
  } while (!done);

  presence.innerText = "🔴";

}

// fetch -> getReader -> read -> decode -> parse

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
