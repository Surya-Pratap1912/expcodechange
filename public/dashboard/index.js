const sendMsg = document.querySelector("#send");
const container = document.getElementById("container");
const loggedUser = localStorage.getItem("loggedInUser");
const chats = document.getElementById("chats");
const backgroundContainer = document.getElementById("background-container");
const popupContainer = document.getElementById("popup-container");
var back = document.getElementById("back");
const groups = document.getElementById("groups");
var messeges = [];

var socket = io();

socket.on("error", (err) => {
  console.log(err);
});

socket.on("mms", (data) => {
  console.log(data);
  const { fileUrl, fileName, type, sentBy, time, groupName } = data;
  const group = localStorage.getItem("group");
  if (group.split(" ")[0] == "opened") {
    //open group
    if (group.split(" ")[1] == groupName)
      printMsg({ sentBy, text: { fileName, fileUrl }, time, type }, loggedUser);
  }
});

socket.on("received-msg", (msg) => {
  // console.log(msg.groupName);
  if (messeges[msg.groupName]) {
    messeges[msg.groupName].push(msg);
  } else {
    messeges[msg.groupName] = [];
    messeges[msg.groupName].push(msg);
  }

  console.log(messeges);
  const group = localStorage.getItem("group");
  if (group.split(" ")[0] == "opened") {
    //open group
    if (group.split(" ")[1] == msg.groupName)
      printMsg(
        { sentBy: msg.sentBy, text: msg.msg, time: msg.time, type: "text" },
        loggedUser
      );
  }
});

socket.on("log", () => {
  console.log("logged in");
  socket.emit("join-user", loggedUser);
});
socket.on("user-connected", () => {
  console.log(`${loggedUser} connected`);
});

const token = localStorage.getItem("token");
console.log(token);

document.getElementById("logout").addEventListener("click", () => {
  axios
    .get(`http://localhost:10000/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((resp) => {
      if (resp.status === 200) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        // console.log("resp", resp);
        console.log("redirected to login after logout");
      }
    })
    .catch((err) => {
      const redTo = err.response.status;

      if (stat == 401) {
        const redTo = err.response.data.redirectTo;
        if (redTo) {
          console.log("err unautherized, redirecting to /login", redTo);
          window.location.href = redTo;
        } else console.log("err ", err);
      }
    });
});

// checking if user is logged in or not
window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    print();
  } else {
    window.location.href = "/login";
  }
});

//                              printing data on the screen

async function print() {
  try {
    const group = localStorage.getItem("group");
    console.log(group);
    const res = await axios
      .get("http://localhost:10000/get-contacts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        document.getElementById("user-name").innerText = res.data.loggedUser;
        localStorage.setItem("loggedInUser", res.data.loggedUser);
        //open dashboard
        console.log("res data ", res.data);

        // var time_diff = {
        //   user: "",
        //   day: "",
        //   hr: 0,
        //   min: 0,
        // };
        const user = res.data.userName;

        res.data.groups.forEach((group) => {
          printGroup(group);
        });
      });

    if (group.split(" ")[0] == "opened") {
      //open group
      printGroupUsers(group.split(" ")[1]);
      chats.style.display = "flex";
      chats.style.visibility = "visible";
    }
  } catch (error) {
    console.error("Error:", error);

    // Handle specific errors or redirect as needed
    // For example, check if the error response status is 401
    // and redirect the user to the login page
    // if (error.response && error.response.status === 401) {
    //   const redTo = error.response.data.redirectTo;
    //   console.log("Unauthorized, redirecting to /login", redTo);
    //   window.location.href = redTo;
    // }
  }
}

function printMsg({ sentBy, text, time, type }, user, time_diff) {
  // console.log(typeof(createdAt),id,time,user);
  const day = time.slice(0, 3);
  const hr = time.slice(16, 18);
  const min = time.slice(19, 21);
  // console.log('diff ' , (+min - +time_diff.min) )
  // console.log()
  const time_on_screen = document.createElement("h6");
  // console.log(time_diff.hr, hr);
  // if (time_diff.day == "" || time_diff.day != day) {
  //   time_on_screen.innerText = `${hr} : ${min} ${day}`;
  //   container.appendChild(time_on_screen);
  // } else if (time_diff.hr != hr || Math.abs(+time_diff.min - +min) >= 5) {
  //   time_on_screen.innerText = `${hr} : ${min}`;
  //   container.appendChild(time_on_screen);
  // }

  container.appendChild(time_on_screen);
  container.appendChild(time_on_screen);

  const chat = document.createElement("div");
  const userName = document.createElement("h5");
  userName.innerText = `${sentBy}`;
  if (sentBy == user) {
    chat.classList.add("msg", "msg2");
  } else {
    chat.classList.add("msg", "msg1");
    // if (time_diff.user != sentBy)
    chat.appendChild(userName);
  }

  if (type === "log") {
    const log = document.createElement("h6");
    log.innerText = `${text} ${time_on_screen.innerText}`;
    container.appendChild(log);
  } else if (type === "text") {
    const msg = document.createElement("p");
    msg.innerText = `${text}`;

    chat.appendChild(msg);

    container.appendChild(chat);
  } else {
    var img = document.createElement("img");
    img.src = text.fileUrl;
    img.alt = text.fileName;
    chat.appendChild(img);

    img.addEventListener("click", (e) => {
      backgroundContainer.style.display = "block";
      popupContainer.style.display = "block";
      popupContainer.style.backgroundImage = `url('${text.fileUrl}')`;
    });
    const downloadImage = document.getElementById("download-btn");
    downloadImage.addEventListener("click", async (e) => {
      e.preventDefault();
      const a = document.createElement('a');
      a.href = text.fileUrl;
      // a.target = target="_blank"
      a.download = text.fileName;
      document.body.appendChild(a);
      a.click();
      await new Promise(resolve => setTimeout(resolve, 100));

      document.body.removeChild(a);
    });

    container.appendChild(chat);
  }
  container.lastElementChild.scrollIntoView();

  // img.onload = function(){
  //   URL.revokeObjectURL(img.src);
  // }
}

// create group

const groupForm = document.getElementById("group-form");

groupForm.addEventListener("submit", async (e) => {
  try {
    e.preventDefault();
    console.log("in func");
    const groupName = e.target[0].value;
    // console.log(e.target[0].value);
    await axios
      .post(
        "http://localhost:10000/create-group",
        { groupName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        e.target[0].value = "";
      });
    printGroup(groupName);
  } catch (err) {
    console.log("err ", err);
  }
});

const deleteGroup = document.getElementById('delete-group');
deleteGroup.addEventListener('click',async e =>{
  e.preventDefault();
  const group = localStorage.getItem("group");
  if (group.split(" ")[0] == "opened") {
    //open group
    const groupName = group.split(" ")[1] ;
    const resp = await axios.delete(
      `http://localhost:10000/delete-group`,
      {
        params: {groupName},
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    if(resp.status == 200){
      // window.location = '/dashboard';
      const deletedGroup = document.getElementById(groupName);
      back.click();
      deleteGroup.style.display ='none';
      deleteGroup.remove();
      console.log(resp);
    }
  }
})


function printGroup(name) {
  console.log(name);
  const groups = document.getElementById("groups");
  const contact = document.createElement("div");
  const icon = document.createElement("img");
  const groupName = document.createElement("h4");
  groupName.innerText = `${name}`;
  console.log(groupName);
  icon.src = "/src/grp.svg";
  contact.className = "contact";
  contact.appendChild(icon);
  contact.id= groupName;
  contact.appendChild(groupName);
  groups.appendChild(contact);

  contact.addEventListener("click", async (e) => {
    e.preventDefault();
    localStorage.setItem("group", `opened ${name}`);
    // localStorage.setItem("groupOpened", `${name}`);
    chats.style.display = "flex";
    chats.style.visibility = "visible";
    chats.name = name;

    printGroupUsers(name);

    while (container.firstChild && !container.lastChild.remove());
    if (messeges[name]) {
      messeges[name].forEach((msg) => {
        printMsg(
          { sentBy: msg.sentBy, text: msg.msg, time: msg.time, type: "text" },
          loggedUser
        );
      });
    }

    // console.log(chats.name,'this')
  });
}

var c = 0;

async function printGroupUsers(groupName) {
  console.log(c++);
  const contacts = document.getElementsByClassName("contacts");
  const group = document.getElementsByClassName("group");
  document.getElementById("group-name").innerText = groupName;

  // console.log(contacts);
  contacts[0].style.display = "none";
  group[0].style.display = "flex";
  back.style.display = "flex";

  const users = document.getElementById("users");
  addUserForm.style.visibility = "hidden";

  // users.innerHTML = ''; //slower
  // users.textContent = '';

  while (users.firstChild && !users.lastChild.remove());

  await axios
    .get("http://localhost:10000/get-users", {
      headers: { Authorization: `Bearer ${token}`, group: groupName },
    })
    .then((res) => {
      console.log("get - users ", res.data);
      res.data.users.forEach((groupUser) => {
        printUser(groupUser, res.data.admin, groupName);
      });
      if (localStorage.getItem("loggedInUser") == res.data.admin)
        addUserForm.style.visibility = "visible";

      // else addUserForm.style.visibility = "hidden";
    })
    .catch((err) => {
      console.log("error in add user");
      window.alert(err.messege);
    });
}

function printUser(groupUser, adm, groupName) {
  const users = document.getElementById("users");
  const user = document.createElement("div");
  const icon = document.createElement("img");
  const userName = document.createElement("h4");
  const admin = document.createElement("h4");
  const remove = document.createElement("button");
  userName.innerText = `${groupUser}`;
  userName.style.marginRight = "10px";
  userName.style.color = "black";
  userName.style.fontWeight = "bold";
  admin.style.color = "whitesmoke";
  admin.style.fontWeight = "bold";
  remove.innerText = "remove";
  admin.innerText = "admin";
  // console.log(userName);
  icon.src = "/src/user.svg";
  user.className = "user";
  user.appendChild(icon);
  user.appendChild(userName);
  if (groupUser == adm) {
    user.appendChild(admin);
  }
  if (loggedUser == adm && groupUser != adm) {
    user.appendChild(remove);
  }
  users.appendChild(user);

  remove.addEventListener("click", async (e) => {
    e.preventDefault();
    axios.delete(
      `http://localhost:10000/delete-user`,
      {
        params: {groupName,groupUser},
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    user.remove();
  });
}

back.addEventListener("click", (e) => {
  const contacts = document.getElementsByClassName("contacts");
  const group = document.getElementsByClassName("group");

  // console.log(contacts);
  contacts[0].style.display = "flex";
  group[0].style.display = "none";
  back.style.display = "none";
  chats.style.display = "none";
  chats.style.visibility = "hidden";
  localStorage.setItem("group", "closed");
});

// const addUserForm = document.getElementById('add-user-form');
// addUserForm.
//delete button
// const btn = document.createElement("button");

// btn.innerHTML = "Delete";
// btn.addEventListener("click", (e) => {
//   axios
//     .delete(`http://localhost:10000/delete-expanse/${obj.id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//     .then((res) => {
//       window.alert(res.data);
//     })
//     .then(() => {
//       location.reload();
//     });
// });

//                adding users to group

const addUserForm = document.getElementById("add-user-form");
addUserForm.addEventListener("submit", async (add) => {
  add.preventDefault();
  const addUser = add.target[0].value;
  const groupName = document.getElementById("group-name").innerText;
  await axios
    .post(
      "http://localhost:10000/group/add-user",
      { groupName, addUser },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then((res) => {
      console.log(res.data);
      add.target[0].value = "";
      printUser(res.data.user, "");
    })
    .catch((err) => {
      console.log("err in add-user", err);
      window.alert(err.response.data.messege);
    });
});

//                                    pushing data into server

sendMsg.addEventListener("submit", send);
var time_diff = {
  user: "",
  day: "",
  hr: 0,
  min: 0,
};
function send(e) {
  e.preventDefault();
  const groupName = localStorage.getItem("group").split(" ")[1];
  const text = document.getElementById("input-messege");

  console.log(text.value);
  // obj = {
  //   msg,
  // };
  if (text.value != "") {
    const time = new Date().toString();
    console.log(time, text.value);
    const msg = {
      msg: text.value,
      sentBy: loggedUser,
      time,
      groupName,
    };
    socket.emit("sent-messege", msg);
    printMsg(
      { sentBy: loggedUser, text: text.value, time, type: "text" },
      loggedUser
    );
    text.value = "";
    if (messeges[msg.groupName]) {
      messeges[msg.groupName].push(msg);
    } else {
      messeges[msg.groupName] = [];
      messeges[msg.groupName].push(msg);
    }

    console.log(messeges);
  }

  // axios
  //   .post("http://localhost:10000/send-messege", obj, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //   .then((result) => {
  //     console.log(result);
  //     document.getElementById("input-messege").value = "";
  //     print();
  //   })
  //   .catch((err) => console.log(err));

  // location.reload();
}

const mediabtn = document.getElementById("mediabtn");
const media = document.getElementById("media");
mediabtn.addEventListener("click", () => {
  media.click();
});

media.onchange = function (e) {
  console.log(e);
  var file = e.target.files[0];
  var reader = new FileReader();
  const time = new Date().toString();
  // const groupName = localStorage.getItem("group").split(" ")[1];

  reader.onload = function (loadEvent) {
    var buffer = new Uint8Array(loadEvent.target.result);
    var type = file.type;
    console.log("hei bfr", buffer, type);
    socket.emit("mms", {
      fileName: file.name,
      buffer,
      type,
      sentBy: loggedUser,
      time,
      groupName,
    });
  };
  const fileUrl = URL.createObjectURL(file);
  printMsg(
    {
      sentBy: loggedUser,
      text: { fileName: file.name, fileUrl },
      time,
      type: file.type,
    },
    loggedUser
  );

  reader.readAsArrayBuffer(file);
  media.value = "";
};

const closePopupBtn = document.getElementById("close-popup-btn");

closePopupBtn.addEventListener("click", (e) =>{
  e.preventDefault();
  backgroundContainer.style.display = "none";
  popupContainer.style.display = "none";
  popupContainer.lastChild.remove();
});

// const downloadImage = document.getElementById('download-btn');
// downloadImage.addEventListener('click', e =>{
//   e.preventDefault();

// })
