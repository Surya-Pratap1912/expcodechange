
const addExpanse = document.querySelector("#add-expanse");
const amt = document.querySelector("#amt");
const des = document.querySelector("#des");
const cat = document.querySelector("category");
const userlist = document.querySelector("#users");




const token = localStorage.getItem("token");
// console.log(token);

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem('token');
  location.href = "/login";
});

window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    print();
  } else {
    window.location.href = "/login";
  }
});

//                                    pushing data into server

addExpanse.addEventListener("click", onsubmit);

function onsubmit(e) {
  e.preventDefault();

  const amt = document.getElementById("amt").value;
  const des = document.getElementById("des").value;
  const cat = document.getElementById("category").value;

  obj = {
    amt,
    des,
    cat,
  };
  axios
    .post("http://54.173.123.108:10000/add-expanse", obj, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));

  location.reload();
}

//maxlines to show

const linesToShow = document.getElementById('linesToShow');

linesToShow.addEventListener('click', async (e )=>{
  e.preventDefault();
  const lines = document.getElementById('lines').value;
  if(lines)
  {
    localStorage.setItem('lines',lines);
    console.log("lines ", lines);
    location.reload();
  }
})

//show all expanses

const showAll = document.getElementById('showAll');

showAll.addEventListener('click', async (e)=>{
  location.href = '/showAll.html';
})



//                              printing data on the screen

function print() {
  axios
    .get("http://54.173.123.108:10000/get-expanse", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      console.log("res  data  ",response.data);
      document.getElementById("user").innerHTML = response.data.userName;

      let exp_s=-1;
      var arr 
      var exp_e=0;
      if (response.data.ispremiumuser) {
        document.getElementById("buy").style.visibility = "hidden";
        document.getElementById("showLead").style.visibility = "visible";
        document.getElementById("totalExpanse").innerText = `total Expanse ${response.data.totalExpanse}`;
        document.getElementById('premShow').style.visibility = "visible";

        exp_s=response.data.exp.length ;
       arr = response.data.exp;
       mxLines=localStorage.getItem('lines');
       if(+mxLines >= (+exp_s) )
       {
        exp_e =0;
        exp_e= +exp_e;
       }
       else{
        exp_e = +exp_s - +mxLines;
       }

        printLeads();
        // printUrls();
        console.log(response.data);
        const downloaded = document.getElementById('downloaded');
        let url= response.data.urls ; 
        let n = response.data.urls.length;
        if(n > 0)
        {
          for(let i=n-1;i>=0 ;i--)
          {
            const li = document.createElement('li'); 
            const a = document.createElement('a');
            a.href = url[i].fileUrl
            console.log(url[i].fileUrl);
            
            a.innerText = `downloaded ${n-i}`;
            li.appendChild(a);
            downloaded.appendChild(li);
          }
        }
        document.getElementById("premiumuser").innerText =
          "you are a premium user";
      }
      else {
        exp_s = response.data.arr.length;
         arr = response.data.arr;
         exp_e=0;
         exp_e = +exp_e;
      }
      console.log(arr, exp_s,exp_e);
      for(let i = +exp_s - 1 ; i>=exp_e ; i--)
      {
        printList(arr[i]);
      }
    });
}

function printList(obj) {
  const li = document.createElement("li");

  const txt = document.createTextNode(`${obj.amt} ${obj.des}`);
  txt.className = "txtnode";
  li.appendChild(txt);

  const btn = document.createElement("button");
  btn.className = "btn btn-dark";
  btn.innerHTML = "Delete";
  li.appendChild(btn);

  const edit = document.createElement("button");
  edit.className = "btn btn-dark";
  edit.innerHTML = "Edit";
  edit.classList.add("ms-5");
  li.appendChild(edit);

  const inpId = document.createElement("input");
  inpId.type = "hidden";
  inpId.value = "update";
  li.appendChild(inpId);

  userlist.appendChild(li);

  btn.addEventListener("click", (e) => {
    axios
      .delete(`http://54.173.123.108:10000/delete-expanse/${obj.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        window.alert(res.data);
      })
      .then(() => {
        location.reload();
      });
  });

  edit.addEventListener("click", (e) => {
    // axios.post(`http://localhost:3005/delete-data/${obj.id}`);

    document.getElementById("amt").value = `${obj.amt}`;
    document.getElementById("des").value = `${obj.des}`;
    document.getElementById("category").value = `${obj.cat}`;

    const upd = document.getElementById("update");
    upd.type = "button";

    upd.addEventListener("click", (e) => {
      e.preventDefault();
      const amt = document.getElementById("amt").value;
      const des = document.getElementById("des").value;
      const cat = document.getElementById("category").value;

      // console.log(amt, des, cat);

      const updData = {
        amt,
        des,
        cat,
      };

      axios
        .put(`http://54.173.123.108:10000/update-expanse/${obj.id}`, updData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          window.alert(res.data);
        })
        .then(() => {
          location.reload();
        });
    });
  });
}

//                                          Show Leaderboard

async function printLeads() {
  try {
    const Leaderboard = await axios.get(
      "http://54.173.123.108:10000/premium/showLeaderBoard",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // console.log("lead -->>  ", Leaderboard);
    // const leads = document.getElementById('ldrboard');

    // leads.removeChild(document.getElementById(""));
    Leaderboard.data.forEach((arr) => {
      console.log(arr);
      printLine(arr);
    });
  } catch (err) {
    console.log("error in showlead ", err);
  }
}

function printLine(arr) {
  const leads = document.getElementById("ldrboard");

  const li = document.createElement("li");
  li.appendChild(
    document.createTextNode(` ${arr.userName}   ${arr.totalExpanse}`)
  );
  leads.appendChild(li);
}

const showLead = document.getElementById("showLead");

showLead.addEventListener("click", async (e) => {
  e.preventDefault();
  const show = localStorage.getItem('show');
  if(show == 'off'){
  document.getElementById("ldrboard").style.visibility = "visible";
  localStorage.setItem('show','on');
  showLead.innerText='Hide Leaderboard';
  }
  else{
    document.getElementById("ldrboard").style.visibility = "hidden";
    localStorage.setItem('show','off');
  showLead.innerText='Show Leaderboard';
  }
});


//                                  download file


const dwn = document.getElementById('downloadFile');

dwn.addEventListener('click', async (e) =>{
  e.preventDefault();
  console.log("dwn 1");
  // const p =document.createElement('p')
  // p.appendChild(document.createTextNode('clicked'));
  // dwn.parentElement.appendChild(p);
  // p.style.color = 'red';
  // p.style.fontSize = '40px';


  axios
    .get("http://54.173.123.108:10000/dowload/download-expanse", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((result) => {
      console.log("result ",result);
      if(result.status== 200)
      {
        var a = document.createElement('a');
        a.href = result.data.fileUrl;
        a.download = 'myexpanse.csv';
        a.click();
      }
      console.log(result);
    })
    .catch((err) => console.log("err in dwn",err));
  
})