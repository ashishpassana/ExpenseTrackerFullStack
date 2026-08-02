if(localStorage.getItem("token")){
    window.location.href = "index.html";
}

const elements = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    registerBtn: document.getElementById("registerBtn"),
};

elements.registerBtn.addEventListener("click", async () => {

    const userData = {
        name: elements.name.value,
        email: elements.email.value,
        password: elements.password.value,
    };

    try {

        await registerUser(userData);

        alert("Registration Successful");

        window.location.href = "login.html";

    } catch(err){

        alert(err.message);

    }

});