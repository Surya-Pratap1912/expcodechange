const addExpanse = document.querySelector("#add-expanse");
const amt = document.querySelector("#amt");
const des = document.querySelector("#des");
const cat = document.querySelector("category");
const expanses = document.querySelector("#expanses");
const token = localStorage.getItem("token");

window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    printScreen();
  } else {
    window.location.href = "/login";
  }
});

//                              printing data on the screen

function printScreen() {
  axios
    .get("http://54.226.18.204:11000/get-expanse", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      document.getElementById("user").innerHTML = response.data.userName;
      const tE = (document.getElementById(
        "tE"
      ).innerText = `${response.data.totalExpanse}`);
      console.log(response.data);
      let exp_s = -1;
      var arr;
      var exp_e = 0;
      if (response.data.ispremiumuser) {
        document.getElementById("premiumuser").innerText =
          "you are a premium user";
        document.getElementById(
          "totalExpanse"
        ).innerText = `total Expanse ${response.data.totalExpanse}`;

      
        const downloaded = document.getElementById("downloaded");
      }

      response.data.arr.forEach((x) => {
        printList(x);
      });
    });
}

function printList(obj) {
  const li = document.createElement("li");
  const txt1 = document.createElement("h4");
  const txt2 = document.createElement("h4");
  const txt3 = document.createElement("h4");
  const txt4 = document.createElement("h4");
  txt1.innerText = ` ${obj.des} `;
  txt2.innerText = ` ${obj.cat} `;
  txt3.innerText = ` ${obj.amt} `;
  txt1.className = "txtnode";
  txt2.className = "txtnode";
  txt3.className = "txtnode";
  txt4.className = "txtnode";
  li.appendChild(txt1);
  li.appendChild(txt2);
  li.appendChild(txt3);
  li.appendChild(txt4);

  const btn = document.createElement("button");
  btn.className = "btn btn-dark";
  btn.innerHTML = "Delete";
  li.appendChild(btn);
  expanses.appendChild(li);

  btn.addEventListener("click", (e) => {
    axios
      .delete(`http://54.226.18.204:11000/delete-expanse/${obj.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        window.alert(res.data);
      })
      .then(() => {
        location.reload();
      });
  });
}

//                                  download file

const dwn = document.getElementById("downloadFile");

dwn.addEventListener("click", async (e) => {
  e.preventDefault();
  axios
    .get("http://54.226.18.204:11000/dowload/download-expanse", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((result) => {
      if (result.status == 200) {
        var a = document.createElement("a");
        a.href = result.data.fileUrl;
        a.download = "myexpanse.csv";
        a.click();
      }
      console.log(result);
    })    
    .catch((err) => console.log(err));
});
