const form = document.getElementById("myform");
// document.gete

form.addEventListener("submit", (e) => {
  // console.log('i m in')
  e.preventDefault();
  // console.log(e);

  const mail = document.getElementById("mailId").value;
  //   const password = document.getElementById("psw").value;

  // console.log("working");

  axios
    .post("http://54.226.18.204:10000/password/forget-password", { mail })
    .then((res) => {
      // console.log("res.data from forget pass ", res.data);
      alert(res.data.message);
      location.reload();
    })
    .catch((err) => {
      console.log(err);
      // alert(res.data.message);
    });
});
