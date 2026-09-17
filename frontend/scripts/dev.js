const { spawn, exec } = require("child_process");
const http = require("http");

const nextDev = spawn("npm", ["run", "dev:next"], {
    stdio: "inherit",
    shell: true,
});

let browserOpened = false;

function openBrowser() {
    if (browserOpened) return;

    browserOpened = true;

    exec('start "" "http://localhost:3000/login"');
}

function waitForServer() {
    http.get("http://localhost:3000/login", (res) => {
        if (res.statusCode === 200) {
            openBrowser();
        } else {
            setTimeout(waitForServer, 500);
        }
    }).on("error", () => {
        setTimeout(waitForServer, 500);
    });
}

waitForServer();

nextDev.on("exit", (code) => process.exit(code ?? 0));