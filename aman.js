const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron');
const path = require('path');
const shortcut = require('electron-localshortcut');
const RPC = require('discord-rpc');
const axios = require('axios');
const { updateElectronApp } = require('update-electron-app');

updateElectronApp();

const CLIENT_URL = "https://github.com/AmanLovesCats/Repuls-Client"
const RPC_CLIENT_ID = "1429162289206001677";
const GAME_URL = "https://repuls.io";

const sessionStartTime = Date.now();
let win;
let rpc;
let gameState = {
    current: "In Menu",
    serverInfo: { region: null, port: null, map: null, mode: null, players: 0, maxPlayers: 0 },
    showJoinButton: true,
    playFabData: {
        sessionTicket: null,
        playFabId: null,
        fullAccountInfo: "No data captured yet. Open the game to login dum dum"
    }
};

app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.commandLine.appendSwitch('enable-vulkan');
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('force_high_performance_gpu');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,CanvasOopRasterization,UseSkiaRenderer,WebGPU');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-print-preview');
app.commandLine.appendSwitch('disable-metrics');
app.commandLine.appendSwitch('disable-metrics-repo');
app.commandLine.appendSwitch('smooth-scrolling');
app.commandLine.appendSwitch('enable-javascript-harmony');
app.commandLine.appendSwitch('enable-future-v8-vm-features');
app.commandLine.appendSwitch('disable-hang-monitor');
app.commandLine.appendSwitch('no-referrers');
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa');
app.commandLine.appendSwitch('disable-bundled-ppapi-flash');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage=100');
app.commandLine.appendSwitch('enable-pointer-lock-options');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('js-flags', '--expose-gc');
// dangerous but useful (according to my tests, it unblocks certain advertisements)
app.commandLine.appendSwitch('disable-web-security');

app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
    if (url.includes("docskigames.com") || url.includes("repuls.io")) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});

// ------------------------------------ RPC connection to Discord
async function setupDiscordRPC() {
    rpc = new RPC.Client({ transport: "ipc" });
    rpc.on("ready", async () => {
        await updateRPC();
        await refreshServerData();
        setInterval(async () => {
            if (gameState.current === "Playing" && gameState.serverInfo.region) {
                await refreshServerData();
            }
        }, 30000);
    });
    rpc.login({ clientId: RPC_CLIENT_ID }).catch(console.error);
}

async function updateRPC() {
    if (!rpc) return;

    let details = "A Docski Game";
    let state = "Main Menu";
    let buttons = [{ label: "View Client", url: CLIENT_URL }];
    let party = undefined;
    let secrets = undefined;

    if (gameState.current === "Playing" && gameState.serverInfo.region && gameState.serverInfo.port) {
        details = `${gameState.serverInfo.mode || "Combat"} on ${gameState.serverInfo.map || "Repuls"}`;
        state = `Match: ${gameState.serverInfo.players}/${gameState.serverInfo.maxPlayers} players`;

        const joinLink = `${GAME_URL}/?r=${gameState.serverInfo.region}&game=${gameState.serverInfo.port}`;
        const isGameFull = gameState.serverInfo.players >= gameState.serverInfo.maxPlayers;

        if (gameState.showJoinButton && !isGameFull) {
            buttons.unshift({ label: "Join My Match", url: joinLink });
            party = {
                id: `repuls-${gameState.serverInfo.region}-${gameState.serverInfo.port}`,
                size: [gameState.serverInfo.players || 1, gameState.serverInfo.maxPlayers || 12]
            };
            secrets = {
                join: joinLink
            };
        }
    }

    try {
        await rpc.setActivity({
            details: details,
            state: state,
            startTimestamp: sessionStartTime,
            largeImageKey: "b5ffbbc93f102bde5c6af1b5b6175853",
            largeImageText: "Repuls.io Client",
            buttons: buttons.slice(0, 2),
            party: party,
            secrets: secrets,
            instance: true,
        })
    } catch (error) {
        console.error("RPC Update Error:", error);
    }
}

// ------------------------------------ game interaction
async function refreshServerData() {
    if (gameState.current !== "Playing" || !gameState.serverInfo.region) return;
    try {
        const response = await axios.get(`https://rep.${gameState.serverInfo.region}.docskigames.com/serverList`);
        const servers = response.data.serverList;
        const match = servers.find(s => s.webPort === gameState.serverInfo.port.toString());
        if (match) {
            gameState.serverInfo.map = match.gameMap;
            gameState.serverInfo.mode = match.gameMode;
            gameState.serverInfo.players = parseInt(match.playerCount, 10);
            gameState.serverInfo.maxPlayers = parseInt(match.maxPlayers, 10);
            await updateRPC();
        }
    } catch (error) {
        console.error("[API Error]", error.message);
    }
}

function buildDiscordInviteText() {
    if (gameState.current !== "Playing" || !gameState.serverInfo.region || !gameState.serverInfo.port) {
        return "Not currently in a match.";
    }
    const joinUrl = `${GAME_URL}/?r=${gameState.serverInfo.region}&game=${gameState.serverInfo.port}`;
    return [
        "🎮 **Repuls.io Match Invite**",
        `🗺️ **Map:** ${gameState.serverInfo.map || "Unknown"}`,
        `⚔️ **Mode:** ${gameState.serverInfo.mode || "Unknown"}`,
        `👥 **Players:** ${gameState.serverInfo.players || "?"} / ${gameState.serverInfo.maxPlayers || "?"}`,
        `🌍 **Region:** ${gameState.serverInfo.region.toUpperCase()}\n`,
        `🔗 **Join Match:** ${joinUrl}`
    ].join('\n');
}

// ------------------------------------ window
function setupDebugger(window) {
    try {
        window.webContents.debugger.attach("1.3");
    } catch (error) {
        console.error("Debugger attach failed: ", error);
    }

    window.webContents.debugger.on("message", async (event, method, params) => {
        if (method === "Network.responseReceived") {
            const { url } = params.response;
            if (url.includes("Client/LoginWithCustomID")) {
                const requestId = params.requestId;
                try {
                    const result = await window.webContents.debugger.sendCommand("Network.getResponseBody", { requestId });
                    const body = JSON.parse(result.body);
                    if (body.data && body.data.PlayFabId) {
                        gameState.playFabData.playFabId = body.data.PlayFabId;
                        gameState.playFabData.sessionTicket = body.data.SessionTicket;
                        // fetchFullAccountInfo();
                    }
                } catch (error) {
                    console.error("Failed to get login body", error);
                }
            }
        }
    });
    window.webContents.debugger.sendCommand("Network.enable");
}

app.on("ready", async () => {
    win = new BrowserWindow({
        width: 1920, height: 1080,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            backgroundThrottling: false,
        }
    });

    await setupDebugger(win);

    win.loadURL(GAME_URL);
    win.removeMenu();

    win.webContents.on("console-message", async (event, level, message, line, sourceId) => {
        if (message) {
            /*
            [friend] status: {"ev":"setOnlineStatus","data":"{\"code\":2,\"msg\":\"In Menu\"}"}
            [friend] status: {"ev":"setOnlineStatus","data":"{\"code\":6,\"msg\":\"eu01|8020\"}"}
            */
            const trigger = "[friend] status: "
            if (message && message.startsWith(trigger)) {
                try {
                    const jsonText = message.substring(trigger.length);
                    const status = JSON.parse(jsonText);
                    const data = JSON.parse(status.data);

                    if (data.code === 2) {
                        gameState.current = data.msg; // In Menu
                        gameState.serverInfo.region = null;
                        gameState.serverInfo.port = null;
                        await updateRPC();
                    } else if (data.code === 6) {
                        gameState.current = "Playing";
                        const match = data.msg.match(/^(\w+)\|(\d+)$/);
                        if (match) {
                            gameState.serverInfo.region = match[1];
                            gameState.serverInfo.port = parseInt(match[2], 10);
                            await refreshServerData();
                        }
                        await updateRPC();
                    }
                } catch (error) {
                    console.error("Error parsing friend status:", error);
                }
            }
        }
    });

    const isGoogleAuth = (url) => {
        return url.includes("accounts.google.com") ||
            url.includes("googleusercontent.com") ||
            url.includes("apis.google.com");
    };

    win.webContents.on("will-navigate", (event, navigationUrl) => {
        if (navigationUrl.startsWith(GAME_URL) || isGoogleAuth(navigationUrl)) return;
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (isGoogleAuth(url)) return { action: "allow" };
        shell.openExternal(url);
        return { action: "deny" };
    });

    shortcut.register(win, "F1", () => win.loadURL(GAME_URL));
    shortcut.register(win, "Ctrl+F1", () => {
        app.relaunch();
        app.quit();
    });
    shortcut.register(win, "Ctrl+F5", () => {
        win.webContents.session.clearStorageData({
            storages: ["appcache", "cookies", "filesystem", "indexdb", "localstorage", "shadercache", "websql", "serviceworkers", "cachestorage"]
        });
        dialog.showMessageBox(win, {
            type: "info",
            title: "Storage Cleared",
            message: "Data cleared. Reload with F1.",
            buttons: ["OK"]
        });
    });
    shortcut.register(win, "F6", async () => {
        gameState.showJoinButton = !gameState.showJoinButton;
        await updateRPC();
        dialog.showMessageBox(win, {
            type: "info",
            title: "RPC Toggle",
            message: `Join button ${gameState.showJoinButton ? "ENABLED" : "DISABLED"}.`,
            buttons: ["OK"]
        });
    });
    shortcut.register(win, "F9", async () => {
        if (gameState.current === "Playing") await refreshServerData();
        clipboard.writeText(buildDiscordInviteText());
        dialog.showMessageBox(win, { type: "info", title: "Invite Copied", message: "Invite text copied!", buttons: ["OK"] });
    });
    shortcut.register(win, "F11", () => win.setSimpleFullScreen(!win.isSimpleFullScreen()));
    shortcut.register(win, "F12", () => {
        if (!gameState.playFabData.playFabId) {
            dialog.showMessageBox(win, {
                type: "warning",
                title: "No PlayFab ID",
                message: "PlayFab ID not captured yet. Log into the game first.",
                buttons: ["OK"]
            });
            return;
        }

        clipboard.writeText(gameState.playFabData.playFabId);
        dialog.showMessageBox(win, {
            type: "info",
            title: "PlayFab ID Copied",
            message: "PlayFab ID copied to clipboard. Paste in /link through amans repuls client bot to link your account.",
            buttons: ["OK"]
        });
    });

    await setupDiscordRPC();
});