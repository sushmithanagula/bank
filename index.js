let banks = ["Union Bank", "Canara Bank", "SBI", "HDFC Bank", "ICICI Bank"];
let users = JSON.parse(localStorage.getItem("users")) || {};
let selectedBank = localStorage.getItem("selectedBank") || null;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let transactions = JSON.parse(localStorage.getItem("transactions")) || {};

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("selectedBank", selectedBank);
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* Show Bank Selection */
function showBankSelection() {
    let options = banks.map(bank => {
        let className = selectedBank === bank ? "bank-card selected" : "bank-card";
        return `
            <div class="${className}" onclick="selectBank('${bank}')">${bank}</div>
        `;
    }).join("");
    let str = `<h2>Select Your Bank</h2><div class="bank-list">${options}</div>`;
    document.getElementById("root").innerHTML = str;
}

function selectBank(bank) {
    selectedBank = bank;
    if (!users[selectedBank]) users[selectedBank] = [];
    saveData();
    showLogin();
}

function showLogin() {
    let str = `
    <h2>${selectedBank} - Login</h2>
    <p><input id="email" type="text" placeholder="Email"></p>
    <p><input id="password" type="password" placeholder="Password"></p>
    <button class="primary" onclick='chkUser()'>Log In</button>
    <p>Not a member? <button class="secondary" onclick='showSignup()'>Register</button></p>
    <p><button class="danger" onclick='showBankSelection()'>Change Bank</button></p>
    <div id="msg"></div>
    `;
    document.getElementById("root").innerHTML = str;
}

function chkUser() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let bankUsers = users[selectedBank] || [];

    let foundUser = bankUsers.find(u => u.email === email && u.password === password);

    if (foundUser) {
        currentUser = foundUser;
        saveData();
        showDashboard();
    } else {
        document.getElementById("msg").innerHTML = "<p style='color:red'>Invalid Credentials!</p>";
    }
}

function showSignup() {
    let str = `
    <h2>${selectedBank} - Register</h2>
    <p><input id="name" type="text" placeholder="Name"></p>
    <p><input id="email" type="text" placeholder="Email"></p>
    <p><input id="password" type="password" placeholder="Password"></p>
    <p><input id="balance" type="number" placeholder="Initial Balance"></p>
    <button class="primary" onclick='saveUser()'>Register</button>
    <p><button class="danger" onclick='showLogin()'>Back to Login</button></p>
    `;
    document.getElementById("root").innerHTML = str;
}

function saveUser() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let balance = document.getElementById("balance").value;

    if (!users[selectedBank]) users[selectedBank] = [];

    users[selectedBank].push({
        name: name,
        email: email,
        password: password,
        balance: balance
    });

    saveData();
    showLogin();
}

function showDashboard() {
    let str = `
    <h2>Welcome, ${currentUser.name}</h2>
    <p>Bank: ${selectedBank}</p>
    <button class="danger" onclick='logout()'>Logout</button>
    <p><select id="type">
       <option value=1>Deposit</option>
       <option value=2>Withdraw</option>
       <option value=3>Transfer</option>
    </select></p>
    <p><input type="number" id="amount" placeholder="Enter Amount"></p>
    <div id="transferDetails" style="display:none;">
        <p><input id="transferMethod" type="text" placeholder="UPI ID / Account Number"></p>
        <p><input id="transferName" type="text" placeholder="Recipient's Name"></p>
    </div>
    <button class="primary" onclick='saveTransaction()'>Submit</button>
    <p><b>Current Balance: ₹<span id='spBalance'>${currentUser.balance}</span></b></p>
    <h3>Transaction History</h3>
    <div class="history-container">${showHistory()}</div>
    `;
    document.getElementById("root").innerHTML = str;

    // Show transfer details when transfer is selected
    document.getElementById("type").addEventListener("change", function() {
        if (this.value == 3) {
            document.getElementById("transferDetails").style.display = "block";
        } else {
            document.getElementById("transferDetails").style.display = "none";
        }
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    showLogin();
}

function saveTransaction() {
    let type = document.getElementById("type").value;
    let amount = document.getElementById("amount").value;

    if (type == 1) {
        currentUser.balance = parseInt(currentUser.balance) + parseInt(amount);
        addTransaction("Deposit", amount);
    } else if (type == 2) {
        if (parseInt(currentUser.balance) >= parseInt(amount)) {
            currentUser.balance = parseInt(currentUser.balance) - parseInt(amount);
            addTransaction("Withdrawal", amount);
        } else {
            alert("Insufficient Balance!");
            return;
        }
    } else if (type == 3) {
        let transferMethod = document.getElementById("transferMethod").value;
        let transferName = document.getElementById("transferName").value;

        if (parseInt(currentUser.balance) >= parseInt(amount)) {
            currentUser.balance = parseInt(currentUser.balance) - parseInt(amount);
            addTransaction(`Transfer to ${transferName} via ${transferMethod}`, amount);
            alert(`Transfer successful to ${transferName} via ${transferMethod}.`);
        } else {
            alert("Insufficient Balance!");
            return;
        }
    }

    saveData();
    document.getElementById("spBalance").innerHTML = currentUser.balance;
}

function addTransaction(type, amount) {
    if (!transactions[selectedBank]) transactions[selectedBank] = [];
    transactions[selectedBank].push({
        type: type,
        amount: amount
    });
}

function showHistory() {
    if (!transactions[selectedBank]) return "No transactions yet.";
    let history = transactions[selectedBank].map((t, index) => `
        <div class="history-item">
            <span>Transaction ${index + 1}: ${t.type}</span>
            <span>Amount: ₹${t.amount}</span>
        </div>
    `).join("");
    return history;
}

if (!selectedBank) showBankSelection();
else if (!currentUser) showLogin();
else showDashboard();
