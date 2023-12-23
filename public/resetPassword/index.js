const form = document.getElementById("myform");
// document.gete

// form.action = window.location.href;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  // const name = document.getElementById("userName").value;
  // const mail = document.getElementById("mailId").value;
  const password = document.getElementById("psw").value;
  const cnfPassword = document.getElementById("cnf-psw").value;
  console.log("working");

  if (password !== cnfPassword) {
    
    const p = document.createElement("p");
    p.appendChild(document.createTextNode("passwords didn't match"));
    p.style.color = "red";
    form.appendChild(p);
    p.id = "para";
    p.style.color = "red";
    p.style.marginTop = "10px";

    document.getElementById("userName").value = name;
    document.getElementById("mailId").value = mail;
    document.getElementById("psw").value = "";
    document.getElementById("cnf-psw").value = "";
  } else {
    const para = document.getElementById("para");
    if (para) form.removeChild(para);
    const uu_id = window.location.pathname.split('/').pop();
const requestData = { uu_id, password };
    // form.action = window.location.href;
    // http://localhost:3000/password/change-password", {password}
    axios
      .post("http://34.204.0.246:10000/password/resetpassword",requestData)
      .then((res) => {
        console.log("res ",res);
        window.alert(res.data.message);
        location.reload();
      })
      .catch((err) => {
        console.log("err ",err);
      });
  }
});