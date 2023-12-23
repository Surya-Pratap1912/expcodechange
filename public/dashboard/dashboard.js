const sendMsg = document.querySelector("#send");
const container = document.getElementById("container");
const loggedUser = sessionStorage.getItem("loggedInUser");
const chats = document.getElementById("chats");
const backgroundContainer = document.getElementById("background-container");
const popupContainer = document.getElementById("popup-container");
var back = document.getElementById("back");
const groups = document.getElementById("groups");
const group = document.getElementById("group");
var messeges = [];
var time_diff = new Map();

back.addEventListener("click", (e) => {
  const contacts = document.getElementsByClassName("contacts");
  const group = document.getElementsByClassName("group");

  // console.log(contacts);
  contacts[0].style.display = "flex";
  group[0].style.display = "none";
  back.style.display = "none";
  chats.style.display = "none";
  chats.style.visibility = "hidden";
  sessionStorage.setItem("group", "closed");
});

var socket = io();

socket.on("connected", (msg) => {
  console.log("connected", msg.messege);
  socket.emit("connected", { user: loggedUser });
});

socket.on("error", (err) => {
  console.log(err);
});

socket.on("mms", (data) => {
  console.log(data);
  const { fileUrl, fileName, type, sentBy, time, groupName } = data;
  const group = sessionStorage.getItem("group");
  if (group.split(" ")[0] == "opened"){
    //open group  
    if (group.split(" ")[1] == groupName)
          printMsg(
        { sentBy, text: `${fileName} ${fileUrl}`, time, type },
        loggedUser
      );
  }
});

socket.on("user-added", (grp, usr) => {
  console.log("user-added", grp, usr);
  if (loggedUser === usr) {
    printGroup(grp);
    // printUser(groupUser, res.data.admin, groupName);  }
  }else{
    const group = sessionStorage.getItem("group");
    if (group.split(" ")[0] == "opened") {
      if(group.split(" ")[1] == grp){
      printGroupUsers(grp);

    }
  }
}
}
);
socket.on("user-removed", (usr, grp) => {
  console.log("user-removed", grp, usr);
  if (loggedUser === usr) {
    // window.alert('you are removed from this group');
    back.click();
  } else {
    // document.getElementById(usr).remove();
    console.log("user-r");
    printGroupUsers(grp);

  }
});

socket.on("received-msg", (msg) => {
  console.log("msg received after addmsg", msg);
  if (messeges[msg.groupName]) {
    messeges[msg.groupName].push(msg);
  } else {
    messeges[msg.groupName] = [];
    messeges[msg.groupName].push(msg);
  }

  console.log(messeges);
  const group = sessionStorage.getItem("group");
  if (group.split(" ")[0] == "opened") {
    //open group
    let length = sessionStorage.getItem("group-users");
    if (group.split(" ")[1] == msg.groupName)
      printMsg(
        {
          sentBy: msg.sentBy,
          text: msg.msg,
          time: msg.time,
          type: "text",
          length,
        },
        loggedUser
      );
  }
});

socket.on("user-connected", () => {
  console.log(`${loggedUser} connected`);
});

const token = sessionStorage.getItem("token");
console.log(token);

document.getElementById("logout").addEventListener("click", () => {
  axios
    .get(`http://localhost:10000/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((resp) => {
      if (resp.status === 200) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("group");
        sessionStorage.removeItem("show");
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
    const group = sessionStorage.getItem("group");
    console.log(group);
    const res = await axios
      .get("http://localhost:10000/get-contacts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        document.getElementById("user-name").innerText = res.data.loggedUser;
        //open dashboard
        console.log("res data ", res.data);

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
      await axios
        .get(`http://localhost:10000/get-messeges`, {
          params: { name: group.split(" ")[1] },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log(res);
          let length = sessionStorage.getItem("group-users");
          console.log("length", length);
          res.data.msgs.forEach((msg) => {
            // sentBy, text, time, type,groupName, length
            printMsg(
              {
                sentBy: msg.sentBy,
                text: msg.text,
                time: msg.time,
                type: msg.type,
                
              },
              loggedUser
            );
          });
        });
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

function printMsg({ sentBy, text, time, type, groupName }, user) {
  let pre;
  if(time_diff.get(groupName))
  {
    pre=  time_diff.get(groupName);
  }
  else pre = {
    user: "",
    day: 0,
    hr: 0,
    min: 0,
  };
  // console.log(time, user, pre);
  const day = time.slice(0, 3);
  const hr = time.slice(16, 18);
  const min = time.slice(19, 21);
  // console.log()
  let differs = false;
  const time_on_screen = document.createElement("h6");
 
  // console.log('diff ' , (+min - +pre.min) )
  // console.log(time_diff.hr, hr);
  if ((time_diff.day == "" || pre.day != day)||(pre.hr != hr || Math.abs(+pre.min - +min) >= 3)) {
   
    time_on_screen.innerText = `${hr} : ${min} ${day}`;
    container.appendChild(time_on_screen);
  } 

  const chat = document.createElement("div");
  const userName = document.createElement("h5");
  userName.innerText = `${sentBy}`;
  if (sentBy == user) {
    chat.classList.add("msg", "msg2");
  } else {
    chat.classList.add("msg", "msg1");
    if (sentBy != pre.user) {
      chat.appendChild(userName);
    }
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
    const fileName = text.split(" ")[0];
    const fileUrl = text.split(" ")[1];
    img.src = fileUrl;
    img.alt = fileName;
    chat.appendChild(img);

    img.addEventListener("click", (e) => {
      backgroundContainer.style.display = "block";
      popupContainer.style.display = "block";
      popupContainer.style.backgroundImage = `url('${fileUrl}')`;
    });
    const downloadImage = document.getElementById("download-btn");
    downloadImage.addEventListener("click", async (e) => {
      e.preventDefault();
      const a = document.createElement("a");
      a.href = fileUrl;
      // a.target = target="_blank"
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      await new Promise((resolve) => setTimeout(resolve, 100));

      document.body.removeChild(a);
    });

    container.appendChild(chat);
  }
  pre = {
    user:sentBy,
    day,
    hr,
    min,
  };
  time_diff.set(groupName,pre);
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
        socket.emit("group-created", loggedUser, groupName);
      });
    printGroup(groupName);
  } catch (err) {
    console.log("err ", err);
  }
});

function printGroup(name) {
  console.log(name);
  const groups = document.getElementById("groups");
  const contactRow = document.createElement("div");
  const contact = document.createElement("div");
  const icon = document.createElement("img");
  const groupName = document.createElement("h4");
  const deleteGroup = document.createElement("button");
  contactRow.className = "contact-row";
  groupName.innerText = `${name}`;
  console.log(groupName);
  icon.src = "/src/grp.svg";
  contact.className = "contact";
  contact.appendChild(icon);
  contact.id = groupName;
  contact.appendChild(groupName);

  deleteGroup.id = "delete-group";
  deleteGroup.innerText = "delete";

  contactRow.appendChild(contact);
  contactRow.appendChild(deleteGroup);

  groups.appendChild(contactRow);

  contact.addEventListener("click", async (e) => {
    e.preventDefault();
    sessionStorage.setItem("group", `opened ${name}`);
    // sessionStorage.setItem("groupOpened", `${name}`);
    chats.style.display = "flex";
    chats.style.visibility = "visible";
    chats.name = name;

    printGroupUsers(name);
     let obj = {
    user: "#",
    day: 0,
    hr: 0,
    min: 0,
  };
    time_diff.set(name,obj);

    while (container.firstChild && !container.lastChild.remove());
    await axios
      .get(`http://localhost:10000/get-messeges`, {
        params: { name },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("res for msgs", res);
        let length = sessionStorage.getItem("group-users");
        res.data.msgs.forEach((msg) => {
          printMsg(
            {
              sentBy: msg.sentBy,
              text: msg.text,
              time: msg.time,
              type: msg.type,
              groupName: msg.groupName,
              length,
            },
            loggedUser,
            );
        });
      });
    // if (messeges[name]) {
    //   messeges[name].forEach((msg) => {
    //     printMsg(
    //       { sentBy: msg.sentBy, text: msg.msg, time: msg.time, type: "text" },
    //       loggedUser
    //     );
    //   });
    // }

    // console.log(chats.name,'this')
  });

  deleteGroup.addEventListener("click", async (e) => {
    e.preventDefault();
    const resp = await axios.delete(`http://localhost:10000/delete-group`, {
      params: { name },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status == 200) {
      contactRow.remove();
      console.log("delete group", resp);
      // socket.emit('group-deleted',{grp: name});
    }
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
      sessionStorage.setItem("group-users", res.data.users.length);
      res.data.users.forEach((groupUser) => {
        printUser(groupUser, res.data.admin, groupName);
      });
      if (sessionStorage.getItem("loggedInUser") == res.data.admin)
        addUserForm.style.visibility = "visible";

      // else addUserForm.style.visibility = "hidden";
    })
    .catch((err) => {
      console.log("error in get users");
      window.alert(err.response.data.messege);
      back.click();
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
  admin.style.color = "green";
  // console.log(userName);
  icon.src = "/src/user.svg";
  user.className = "user";
  user.id = groupUser;
  user.appendChild(icon);
  user.appendChild(userName);
  if (groupUser == adm) {
    user.appendChild(admin);
  }
  if (loggedUser == adm && groupUser != adm) {
    user.appendChild(remove);
  } else if (loggedUser == adm && groupUser != adm) {
    user.appendChild(remove);
  }
  users.appendChild(user);

  remove.addEventListener("click", async (e) => {
    e.preventDefault();
    axios.delete(`http://localhost:10000/remove-user`, {
      params: { groupName, groupUser },
      headers: { Authorization: `Bearer ${token}` },
    });
    socket.emit("remove-user", { groupName, groupUser });

    user.remove();
  });
}

// back.addEventListener("click", (e) => {
//   const contacts = document.getElementsByClassName("contacts");
//   const group = document.getElementsByClassName("group");

//   // console.log(contacts);
//   contacts[0].style.display = "flex";
//   group[0].style.display = "none";
//   back.style.display = "none";
//   chats.style.display = "none";
//   chats.style.visibility = "hidden";
//   sessionStorage.setItem("group", "closed");
// });

//                adding users to group

const addUserForm = document.getElementById("add-user-form");
addUserForm.addEventListener("submit", async (add) => {
  try {
    add.preventDefault();
    const addUser = add.target[0].value;
    const groupName = document.getElementById("group-name").innerText;
    console.log(addUser, "user", groupName);
    const response = await axios.post(
      "http://localhost:10000/group/add-user",
      { groupName, addUser },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(response);

    add.target[0].value = "";

    if (response.status === 200) {
      const addUserLog = document.getElementById("add-user-log");
      addUserLog.style.display = "block";
      addUserLog.innerText = `${response.data.message}`;
    } else {
      socket.emit("user-added", { grp: groupName, usr: response.data.user });
      printUser(response.data.user, response.data.admin, groupName);
      let time = new Date();
      time.toString();
      const msg = {
        msg:`${response.data.user} joined`,
        sentBy: loggedUser,
        time,
        type: "log",
        groupName,
      };
       
    }
  } catch (error) {
    console.error("Error in add-user:", error);
  }
});

//                                    pushing data into server

sendMsg.addEventListener("submit", send);

function send(e) {
  e.preventDefault();
  const groupName = sessionStorage.getItem("group").split(" ")[1];
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
      type: "text",
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
  if(file){
  var reader = new FileReader();
  const time = new Date().toString();
  const groupName = sessionStorage.getItem("group").split(" ")[1];

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
  console.log('sending media');
  const fileUrl = URL.createObjectURL(file);
  printMsg(
    {
      sentBy: loggedUser,
      text: `${file.name} ${fileUrl}`,
      time,
      type: file.type,
    },
    loggedUser
  );

  reader.readAsArrayBuffer(file);
  media.value = "";
  }
};

const closePopupBtn = document.getElementById("close-popup-btn");

closePopupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  backgroundContainer.style.display = "none";
  popupContainer.style.display = "none";
  popupContainer.lastChild.remove();
});

// handling the screen sizes
// const smallSizeNav = document.getElementById("for-small-size");
// function handleScreenSize() {
//   var screenWidth = window.innerWidth;
//   const groupOpened = sessionStorage.getItem("group");
//   if (groupOpened.split(" ")[0] == "opened") {
//     if (screenWidth < 725) {
//       smallSizeNav.style.display = "block";
//       group.style.display = "none";
//     } else {
//       smallSizeNav.style.display = "none";
//       group.style.display = "flex";
//     }
//   }
// }

// Call the function on page load and window resize
// window.onload = handleScreenSize;
// window.onresize = handleScreenSize;
