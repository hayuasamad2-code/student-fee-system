/////////////////////////////
// AUTH CHECK
/////////////////////////////

const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first!");
    window.location.href = "../index.html";
}

/////////////////////////////
// API HELPER
/////////////////////////////

async function api(url, method = "GET", body = null) {

    const res = await fetch(url, {
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
    <div class="logo">Admin Panel</div>

    <ul>
        <li class="active" onclick="showModule('dashboard')">Dashboard</li>
        <li onclick="showModule('students')">Students</li>
        <li onclick="showModule('payments')">Payments</li>
        <li onclick="showModule('discussion')">
            Discussion
            <span id="msgNotification" class="notification-badge" style="display: none;">0</span>
        </li>
        <li onclick="showModule('security')">
            Security
            <span id="securityNotification" class="notification-badge" style="display: none;">0</span>
        </li>
        <li onclick="showModule('profile')">Profile</li>
        <li onclick="logout()">Logout</li>
    </ul>
</div>

<div class="main">
    <div class="header">
        <h1>Welcome Admin 👑</h1>
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

    // Cache busting
    const timestamp = Date.now();

    ///////////////////////////////////
    // DASHBOARD
    ///////////////////////////////////

    if (module === "dashboard") {

        const payments = await api(`/payments?t=${timestamp}`);
        const students = await api(`/students?t=${timestamp}`);

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        content.innerHTML = `
        <div class="cards">

            <div class="card">
                <h3>TOTAL STUDENTS</h3>
                <p>${students.length}</p>
            </div>

            <div class="card">
                <h3>TOTAL PAYMENTS</h3>
                <p>${payments.length}</p>
            </div>

            <div class="card">
                <h3>TOTAL REVENUE</h3>
                <p>${totalRevenue} ETB</p>
            </div>

        </div>`;
    }

    ///////////////////////////////////
    // STUDENT MANAGEMENT
    ///////////////////////////////////

    else if (module === "students") {

        const students = await api(`/students?t=${timestamp}`);

        let rows = students.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.username}</td>
                <td>
                    <button onclick="editStudent(${s.id}, \`${s.name}\`, \`${s.username}\`)">
                        Edit
                    </button>
                </td>
            </tr>
        `).join('');

        content.innerHTML = `
        <div class="card">

            <h2>Create Student</h2>

            <input id="name" placeholder="Full Name"/>
            <input id="username" placeholder="Username"/>
            <input id="password" placeholder="Password"/>

            <button onclick="createStudent()">
                Create Student
            </button>

        </div>


        <div class="card">
            <h2>All Students</h2>

            <div class="table-wrapper">
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Action</th>
                    </tr>

                    ${rows}
                </table>
            </div>
        </div>`;
    }

    ///////////////////////////////////
    // PAYMENTS MONITOR
    ///////////////////////////////////

    else if (module === "payments") {

        const payments = await api(`/payments?t=${timestamp}`);

        let rows = payments.map(p => `
            <tr>
                <td>${p.studentName || p.student_id}</td>
                <td>${p.month}</td>
                <td>${p.amount} ETB</td>
                <td>${p.status}</td>
                <td>${p.proof_url ? `<a href="${p.proof_url}" target="_blank" style="color: #3b82f6; text-decoration: underline;">View Proof</a>` : 'No Proof'}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');

        content.innerHTML = `
        <div class="card">

            <h2>Payments Monitor</h2>

            <div class="table-wrapper">
                <table>
                    <tr>
                        <th>Student</th>
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
    // DISCUSSION MONITOR
    ///////////////////////////////////

    else if (module === "discussion") {

        const messages = await api(`/messages?t=${timestamp}`);

        // Mark as read - clear notification
        localStorage.setItem('lastReadMessageCountAdmin', messages.length);
        updateNotificationBadge();

        let chat = messages.map(m => `
            <div class="message">
                <b>${m.name}:</b> ${m.message}
                <span style="font-size: 11px; color: #94a3b8; margin-left: 10px;">
                    ${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
        `).join('');

        content.innerHTML = `
        <h2>Discussion Monitor</h2>

        <div class="chat-box" id="chatBox">
            ${chat}
        </div>
        `;

        // Auto scroll to bottom to show latest messages
        setTimeout(() => {
            const chatBox = document.getElementById('chatBox');
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }, 100);
    }

    ///////////////////////////////////
    // ADMIN PROFILE
    ///////////////////////////////////

    else if (module === "profile") {

        const me = await api("/auth/me");

        content.innerHTML = `
        <div class="card">
            <h2>Admin Profile</h2>
            <p style="color: #64748b; margin-bottom: 20px;">Manage your account details and security.</p>

            <div class="form-group" style="margin-bottom: 15px;">
                <label>Full Name</label>
                <input id="me_name" value="${me.name}" placeholder="Your Full Name"/>
            </div>

            <div class="form-group" style="margin-bottom: 15px;">
                <label>Username</label>
                <input id="me_username" value="${me.username}" placeholder="New Username"/>
            </div>

            <div class="form-group" style="margin-bottom: 20px;">
                <label>New Password (leave blank to keep current)</label>
                <input id="me_password" type="password" placeholder="••••••••"/>
            </div>

            <button onclick="updateMe(${me.id})" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;">
                Update Profile
            </button>
        </div>`;
    }

    ///////////////////////////////////
    // SECURITY MONITORING
    ///////////////////////////////////

    else if (module === "security") {

        try {
            const alerts = await api(`/security/alerts?t=${timestamp}`);
            const failedLogins = await api(`/security/failed-logins?t=${timestamp}`);

            // Mark security alerts as read
            localStorage.setItem('lastReadSecurityCount', alerts.length);
            updateSecurityNotification();

            let alertRows = alerts.length > 0 ? alerts.map(a => `
                <tr style="background: #fef2f2;">
                    <td><span style="color: #dc2626; font-weight: 600;">${a.ip_address}</span></td>
                    <td><span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-weight: 600;">${a.attempt_count}</span></td>
                    <td>${a.usernames_tried}</td>
                    <td>${new Date(a.last_attempt).toLocaleString()}</td>
                </tr>
            `).join('') : '<tr><td colspan="4" style="text-align: center; color: #64748b;">No suspicious activity detected</td></tr>';

            let loginRows = failedLogins.slice(0, 50).map(f => `
                <tr>
                    <td>${f.username}</td>
                    <td>${f.ip_address}</td>
                    <td>${f.reason}</td>
                    <td>${new Date(f.attempt_time).toLocaleString()}</td>
                    <td><span style="background: ${f.recent_attempts >= 3 ? '#fee2e2' : '#f1f5f9'}; color: ${f.recent_attempts >= 3 ? '#991b1b' : '#64748b'}; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${f.recent_attempts}</span></td>
                </tr>
            `).join('');

            content.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <h2 style="color: #dc2626; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-shield-alt"></i> Security Alerts
                </h2>
                <p style="color: #64748b; margin-bottom: 15px;">IP addresses with 3+ failed login attempts in the last 24 hours</p>

                <div class="table-wrapper">
                    <table>
                        <tr>
                            <th>IP Address</th>
                            <th>Failed Attempts</th>
                            <th>Usernames Tried</th>
                            <th>Last Attempt</th>
                        </tr>
                        ${alertRows}
                    </table>
                </div>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h2>Failed Login Attempts</h2>
                        <p style="color: #64748b; margin-top: 5px;">Recent failed login attempts (last 50)</p>
                    </div>
                    <button onclick="clearOldLogs()" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Clear Old Logs
                    </button>
                </div>

                <div class="table-wrapper">
                    <table>
                        <tr>
                            <th>Username</th>
                            <th>IP Address</th>
                            <th>Reason</th>
                            <th>Time</th>
                            <th>Recent (1h)</th>
                        </tr>
                        ${loginRows}
                    </table>
                </div>
            </div>`;
        } catch (err) {
            content.innerHTML = `
            <div class="card">
                <h2 style="color: #dc2626; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-shield-alt"></i> Security Monitoring Setup Required
                </h2>
                <p style="color: #64748b; margin-bottom: 15px;">The security monitoring table needs to be set up.</p>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="color: #92400e; margin-bottom: 10px;">Setup Instructions:</h3>
                    <ol style="color: #92400e; margin-left: 20px; line-height: 1.8;">
                        <li>Open a terminal in the <code>backend</code> folder</li>
                        <li>Run: <code style="background: white; padding: 2px 6px; border-radius: 4px;">node setup-security.js</code></li>
                        <li>Restart your server: <code style="background: white; padding: 2px 6px; border-radius: 4px;">node server_v14.js</code></li>
                        <li>Refresh this page</li>
                    </ol>
                </div>

                <p style="color: #64748b; font-size: 12px;">
                    <strong>Note:</strong> Security monitoring will track failed login attempts and alert you about suspicious activity.
                </p>
            </div>`;
        }
    }

    ///////////////////////////////////
    // ACTIVE MENU
    ///////////////////////////////////

    document.querySelectorAll(".sidebar ul li")
        .forEach(li => li.classList.remove("active"));

    document.querySelector(`.sidebar ul li[onclick="showModule('${module}')"]`)
        ?.classList.add("active");
}

/////////////////////////////
// CREATE STUDENT
/////////////////////////////

async function createStudent() {

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!name || !username || !password) {
        alert("Fill all fields!");
        return;
    }

    const res = await fetch("/create-student", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

        body: JSON.stringify({
            name,
            username,
            password
        })
    });

    const data = await res.json();
    alert(data.message || "Saved successfully");

    showModule("students");
}

/////////////////////////////
// EDIT STUDENT (MODAL/FORM)
/////////////////////////////

function editStudent(id, name, username) {
    const content = document.getElementById("content");
    content.innerHTML = `
    <div class="card">
        <h2>Edit Student</h2>
        <p style="color: #64748b; margin-bottom: 20px;">Update details for student ID: ${id}</p>

        <div class="form-group" style="margin-bottom: 15px;">
            <label>Full Name</label>
            <input id="edit_name" value="${name}" placeholder="Full Name"/>
        </div>

        <div class="form-group" style="margin-bottom: 15px;">
            <label>Username</label>
            <input id="edit_username" value="${username}" placeholder="Username"/>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
            <label>New Password (leave blank to keep current)</label>
            <input id="edit_password" type="password" placeholder="••••••••"/>
        </div>

        <div style="display: flex; gap: 10px;">
            <button onclick="saveStudentEdit(${id})" class="btn-primary" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;">
                Save Changes
            </button>
            <button onclick="showModule('students')" style="padding: 10px 20px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 600;">
                Cancel
            </button>
        </div>
    </div>`;
}

async function saveStudentEdit(id) {
    const name = document.getElementById("edit_name").value;
    const username = document.getElementById("edit_username").value;
    const password = document.getElementById("edit_password").value;

    if (!name || !username) {
        alert("Name and Username are required!");
        return;
    }

    try {
        const res = await fetch(`/api/update-student/${id}`, {
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

        alert(data.message || "Updated successfully");
        showModule("students");
    } catch (err) {
        console.error("Update failed:", err);
        alert("Update failed: " + err.message);
    }
}

/////////////////////////////
// UPDATE ADMIN PROFILE
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
        const res = await fetch(`/api/update-student/${id}`, {
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
// NOTIFICATION BADGE
/////////////////////////////

function updateNotificationBadge() {
    const badge = document.getElementById('msgNotification');
    if (!badge) return;

    api("/messages").then(messages => {
        const lastRead = parseInt(localStorage.getItem('lastReadMessageCountAdmin') || '0');
        const unreadCount = Math.max(0, messages.length - lastRead);

        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function updateSecurityNotification() {
    const badge = document.getElementById('securityNotification');
    if (!badge) return;

    api("/security/alerts").then(alerts => {
        const lastRead = parseInt(localStorage.getItem('lastReadSecurityCount') || '0');
        const unreadCount = Math.max(0, alerts.length - lastRead);

        if (unreadCount > 0 || alerts.length > 0) {
            badge.textContent = alerts.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }).catch(err => {
        // Security table not set up yet, hide badge
        badge.style.display = 'none';
    });
}

// Check for new messages and security alerts every 10 seconds
setInterval(() => {
    updateNotificationBadge();
    updateSecurityNotification();
}, 10000);

/////////////////////////////
// CLEAR OLD SECURITY LOGS
/////////////////////////////

async function clearOldLogs() {
    if (!confirm("Clear security logs older than 7 days?")) return;
    
    try {
        const res = await fetch("/security/clear-logs", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        alert(data.message);
        showModule("security");
    } catch (err) {
        alert("Failed to clear logs: " + err.message);
    }
}

/////////////////////////////
// LOAD DEFAULT
/////////////////////////////

showModule("dashboard");
updateNotificationBadge();

// Try to update security notification, but don't block if it fails
setTimeout(() => {
    try {
        updateSecurityNotification();
    } catch (e) {
        console.log("Security monitoring not available");
    }
}, 1000);
