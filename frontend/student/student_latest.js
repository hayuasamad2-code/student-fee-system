/////////////////////////////
// AUTH CHECK
/////////////////////////////

const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first!");
    window.location.href = "../index.html";
}

// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5008'
    : 'https://student-fee-backend-db3b.onrender.com';

console.log("🚀 [FRONTEND] Student Dashboard");
console.log("🌐 API URL:", API_URL);

/////////////////////////////
// API HELPER
/////////////////////////////

async function api(url, method = "GET", body = null) {
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    const res = await fetch(fullUrl, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : null
    });

    return res.json();
}

/////////////////////////////
// PAGE STRUCTURE
/////////////////////////////

document.body.innerHTML = `
<div class="menu-toggle" onclick="toggleMenu()">
    <i class="fas fa-bars"></i>
</div>

<div class="sidebar" id="sidebar">
    <div class="logo">Student Panel</div>

    <ul>
        <li class="active" onclick="showModule('dashboard')">Dashboard</li>
        <li onclick="showModule('pay')">Pay Fees</li>
        <li onclick="showModule('history')">Payment History</li>
        <li onclick="showModule('discussion')">
            Discussion Group
            <span id="msgNotification" class="notification-badge" style="display: none;">0</span>
        </li>
        <li onclick="showModule('profile')">Profile</li>
        <li onclick="logout()">Logout</li>
    </ul>
</div>

<div class="main">
    <div class="header">
        <h1><img src="logo.png" alt="HRU Logo" style="height: 50px; width: 50px; vertical-align: middle; margin-right: 15px; border-radius: 50%;"> HRU weltehi Student Union 👋</h1>
    </div>

    <div id="content"></div>
</div>
`;

function toggleMenu(show = null) {
    const sidebar = document.getElementById("sidebar");
    if (show === null) {
        sidebar.classList.toggle("active");
    } else if (show) {
        sidebar.classList.add("active");
    } else {
        sidebar.classList.remove("active");
    }
}

/////////////////////////////
// LOGOUT
/////////////////////////////

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
}

/////////////////////////////
// MODULE LOADER
/////////////////////////////

async function showModule(module) {

    const content = document.getElementById("content");

    content.innerHTML = "Loading...";

    // Auto hide menu
    toggleMenu(false);

    ///////////////////////////////////
    // DASHBOARD
    ///////////////////////////////////

    if (module === "dashboard") {

        const profile = await api("/auth/me");

        content.innerHTML = `
        <div class="cards">
            <div class="card">
                <h3>NAME</h3>
                <p>${profile.name}</p>
            </div>

            <div class="card">
                <h3>USERNAME</h3>
                <p>${profile.username}</p>
            </div>

            <div class="card">
                <h3>ROLE</h3>
                <p>${profile.role}</p>
            </div>
        </div>`;
    }

    ///////////////////////////////////
    // PAY FEES (REAL SYSTEM)
    ///////////////////////////////////

    else if (module === "pay") {

        content.innerHTML = `
        <div class="card">
            <h2>Pay Monthly Fees</h2>

            <label>Month</label>
            <select id="month">
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
            </select>

            <br><br>

            <label>Amount</label>
            <input 
                id="amount"
                type="number"
                placeholder="Enter amount"
                style="width:100%; padding:10px; margin-top:5px;"
            />

            <br><br>

            <label>Payment Proof (Screenshot/File)</label>
            <input 
                id="proof"
                type="file"
                style="width:100%; padding:10px; margin-top:5px;"
            />

            <button class="pay-btn" onclick="payNow()">
                Pay Now
            </button>
        </div>`;
    }

    ///////////////////////////////////
    // PAYMENT HISTORY
    ///////////////////////////////////

    else if (module === "history") {

        const payments = await api("/payments");

        let rows = payments.map(p => `
            <tr>
                <td>${p.month}</td>
                <td>${p.amount} ETB</td>
                <td>
                    <span class="${p.status === 'paid'
                ? 'badge-paid'
                : 'badge-pending'}">
                        ${p.status}
                    </span>
                </td>
                <td>${p.status === 'paid' ? `<a href="${p.proof_url}" target="_blank" style="color: #3b82f6; text-decoration: underline;">View Proof</a>` : '-'}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

        content.innerHTML = `
        <div class="card">
            <h2>Payment History</h2>

            <div class="table-wrapper">
                <table>
                    <tr>
                        <th>Month</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Evidence</th>
                        <th>Date</th>
                    </tr>

                    ${rows}
                </table>
            </div>
        </div>`;
    }

    ///////////////////////////////////
    // DISCUSSION
    ///////////////////////////////////

    else if (module === "discussion") {

        const messages = await api("/messages");
        const me = await api("/auth/me");

        // Mark as read - clear notification
        localStorage.setItem('lastReadMessageCount', messages.length);
        updateNotificationBadge();

        let chat = messages.map(m => {
            return `
            <div class="message" style="background: #f1f5f9; color: #1e293b; padding: 10px 12px; border-radius: 12px; margin-bottom: 8px; max-width: 85%;">
                <div style="margin-bottom: 5px;">
                    <b style="font-size: 13px;">${m.name}</b>
                </div>
                <div style="font-size: 13px; line-height: 1.5; margin-bottom: 5px;">
                    ${m.message}
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 11px; color: #94a3b8;">
                        ${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            </div>
        `}).join('');

        content.innerHTML = `
            <h2>Discussion Group</h2>

            <div class="chat-box" id="chatBox">
                ${chat}
            </div>

            <div class="chat-input">
                <input id="msgInput" placeholder="Type a message..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Send</button>
            </div>
        `;

        // Auto scroll to bottom to show latest messages
        setTimeout(() => {
            const chatBox = document.getElementById('chatBox');
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
    }

    ///////////////////////////////////
    // PROFILE
    ///////////////////////////////////

    else if (module === "profile") {

        const me = await api("/auth/me");

        content.innerHTML = `
        <div class="card">
            <h2>Your Profile</h2>
            <p style="color: #64748b; margin-bottom: 20px;">View your account information.</p>

            <div class="form-group" style="margin-bottom: 15px;">
                <label>Full Name</label>
                <input id="me_name" value="${me.name}" placeholder="Full Name" readonly style="background-color: #f1f5f9; cursor: not-allowed;"/>
            </div>

            <div class="form-group" style="margin-bottom: 15px;">
                <label>Username</label>
                <input id="me_username" value="${me.username}" placeholder="Username" readonly style="background-color: #f1f5f9; cursor: not-allowed;"/>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
                <label>Role</label>
                <input value="${me.role}" placeholder="Role" readonly style="background-color: #f1f5f9; cursor: not-allowed;"/>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
                <i class="fas fa-info-circle"></i> Contact your administrator to update your profile information.
            </p>
        </div>`;
    }

    ///////////////////////////////////
    // ACTIVE MENU STYLE
    ///////////////////////////////////

    document.querySelectorAll(".sidebar ul li")
        .forEach(li => li.classList.remove("active"));

    document.querySelector(`.sidebar ul li[onclick="showModule('${module}')"]`)
        ?.classList.add("active");
}

/////////////////////////////
// REAL PAYMENT FUNCTION
/////////////////////////////

async function payNow() {

    const month = document.getElementById("month").value;
    const amount = document.getElementById("amount").value;
    const proofFile = document.getElementById("proof").files[0];

    if (!amount) {
        alert("Enter payment amount!");
        return;
    }

    const formData = new FormData();
    formData.append("month", month);
    formData.append("amount", amount);
    if (proofFile) formData.append("proof", proofFile);

    const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    const data = await res.json();
    alert(data.message || "Saved successfully");

    // auto redirect
    showModule("history");
}

/////////////////////////////
// UPDATE PROFILE
/////////////////////////////

async function updateMe(id) {
    const name = document.getElementById("me_name").value;
    const username = document.getElementById("me_username").value;
    const password = document.getElementById("me_password").value;

    if (!name || !username) {
        alert("Name and Username are required!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/update-student/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, username, password })
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text };
        }

        if (!res.ok) {
            throw new Error(data.message || `Status: ${res.status}`);
        }

        alert(data.message || "Profile updated successfully");
        showModule("profile");
    } catch (err) {
        console.error("Update failed:", err);
        alert("Update failed: " + err.message);
    }
}

/////////////////////////////
// SEND MESSAGE
/////////////////////////////

async function sendMessage() {

    const input = document.getElementById("msgInput");
    const message = input.value.trim();

    if (!message) return;

    await api("/messages", "POST", {
        message
    });

    input.value = "";

    showModule("discussion");
}

/////////////////////////////
// NOTIFICATION BADGE
/////////////////////////////

function updateNotificationBadge() {
    const badge = document.getElementById('msgNotification');
    if (!badge) return;

    api("/messages").then(messages => {
        const lastRead = parseInt(localStorage.getItem('lastReadMessageCount') || '0');
        const unreadCount = Math.max(0, messages.length - lastRead);

        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Check for new messages every 10 seconds
setInterval(updateNotificationBadge, 10000);

/////////////////////////////
// LOAD DEFAULT PAGE
/////////////////////////////

showModule("dashboard");
updateNotificationBadge();
