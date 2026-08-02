if(localStorage.getItem("token")){
    window.location.href = "index.html";
}

const elements = {
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  loginBtn: document.getElementById("loginBtn"),
};

elements.loginBtn.addEventListener("click", async () => {
  const userData = {
    email: elements.email.value,
    password: elements.password.value,
  };

  try{
    const data = await loginUser(userData);

    localStorage.setItem("token",data.token);
    localStorage.setItem("userName",data.user.name);

    window.location.href = "index.html";

  } catch (err){

    alert(err.message);

  }
});
