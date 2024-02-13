const form = document.getElementById("myform");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log(e);

  const mail = document.getElementById("mailId").value;
  const password = document.getElementById("psw").value;

  console.log("working");

  const user = {
   
    mail,
    password,
  };
  console.log(user);
  axios
    .post("http://54.226.18.204:11000/users/login", user)
    .then((res) => {
      console.log(res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('show','off');
      localStorage.setItem('lines','0');
      window.alert(res.data.message);
      if(res.data.success)
      window.location.href='/expanse-tracker';
      
    })
    .catch((err) => {
      console.log(err);
    });
});
