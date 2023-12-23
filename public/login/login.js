
const form = document.getElementById("myform");
// document.gete

form.addEventListener("submit", (e) => {
  // console.log('i m in')
  e.preventDefault();
  //console.log(e);

  const mail = document.getElementById("mailId").value;
  const password = document.getElementById("psw").value;

  //console.log("working");

  const user = {
   
    mail,
    password,
  };
 // console.log(user);
  axios
    .post("http://54.226.18.204:10000/users/login", user)
    .then((res) => {
     // console.log(res.data);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('loggedInUser', res.data.userName);
      sessionStorage.setItem('show','off');
      sessionStorage.setItem('group','closed');
      if(res.status == 200){
        const note = document.getElementById('login-note');
        note.style.display = 'block';
        note.innerText = `${res.data.message}`;
        password.value = '';
      }
      // window.alert(res.data.message);
      if(res.data.success)
      window.location.href='/dashboard';
      
    })
    .catch((err) => {
      console.log(err);
    });
});
