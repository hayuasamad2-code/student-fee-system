document.body.innerHTML = `

<!-- Font Awesome -->
<link rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<div class="modal" id="modal" style="display:flex;">
    <div class="card">
        <h2 style="text-align:center;">Login</h2>

        <label style="display:block; margin-top:10px; font-weight:bold; color: white;">User Name</label>
        <div class="input-box">
            <i class="fa fa-envelope"></i>
            <input type="text" id="username" placeholder="Username">
        </div>

        <label style="display:block; margin-top:5px; font-weight:bold; color: white;">Password</label>
        <div class="input-box">
            <i class="fa fa-lock"></i>
            <input type="password" id="password" placeholder="Password">
        </div>

        <button class="submit-btn" id="loginBtn">Login</button>
        <p id="msg" style="color:red; text-align:center; margin-top:10px;"></p>

    </div>
</div>
`;

document.getElementById("loginBtn").onclick = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            if (data.role === "admin") {
                window.location.href = "../admin/admin.html";
            } else {
                window.location.href = "../student/student.html";
            }
        } else {
            msg.innerText = data.message || "Login failed";
        }
    } catch (err) {
        msg.innerText = "Error connecting to server";
        console.error(err);
    }
};

