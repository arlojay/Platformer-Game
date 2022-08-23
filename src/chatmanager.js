const ClientInterface = require("./clientinterface.js");
const Hasher = require("./hasher.js");
const Database = require("@replit/database");
const db = new Database();

class ChatManager {
    static clients = new Map();
    static cooldowns = new Map();
    static messages = [];

    static async setup() {
        this.messages = await db.get("chat/public") ?? [];
    }

    static clientJoin(socket) {
        socket.id = Hasher.hashString(Math.random());

        // On join
        console.log("user join");
        this.clients.set(socket.id, socket);

        socket.account = null;

        socket.cooldownIntervalId = setInterval(() => {
            if (socket.account == null) return;

            let cooldown = this.cooldowns.get(socket.account.id);
            if (cooldown > 0)
                this.cooldowns.set(socket.account.id, cooldown - 1);
        }, 1000)
    }

    static clientLeave(socket) {
        console.log("user left");

        this.clients.delete(socket.id);
        clearInterval(socket.cooldownIntervalId);

        if (socket.account == null) return;
        this.clients.forEach(client => {
            if (client.account == null) return;

            this.sendMessage(client, "user-leave", {
                name: socket.account.username,
                id: socket.account.id
            })
        })

        this.sendChatMessage({
            author: {
                name: socket.account.username + " left the room",
                id: socket.account.id
            },
            time: Date.now()
        });
    }

    static sendChatMessage(message) {
        this.clients.forEach(client => {
            if (client.account == null) return;

            this.sendMessage(client, "message", message);
        })

        this.messages.push(message);
        db.set("chat/public", this.messages);
    }

    static sendMessage(socket, type, message) {
        socket.send(JSON.stringify({ type, message }))
    }

    static async clientAuthMessage(socket, message) {
        const account = await ClientInterface.getClientWithToken(Hasher.hashString(message));

        this.sendMessage(socket, "authenticated", account);

        if (account == null) return;

        socket.account = account;
        this.cooldowns.set(socket.account.id, 2);

        this.clients.forEach(client => {
            if (client.account == null) return;

            this.sendMessage(client, "user-join", {
                name: socket.account.username,
                id: socket.account.id
            });

            this.sendMessage(socket, "user-join", {
                name: client.account.username,
                id: client.account.id
            });
        })

        this.sendChatMessage({
            author: {
                name: socket.account.username + " joined the room",
                id: socket.account.id
            },
            time: Date.now()
        });
    }

    static clientChatMessage(socket, message) {
        if (socket.account == null) return;
        if (!/[^\s]/.test(message)) return; //No empty messages
        message = message.slice(0, 2000);

        let cooldown = this.cooldowns.get(socket.account.id);

        if (cooldown > 3) {
            this.cooldowns.set(socket.account.id, 10);

            this.sendMessage(socket, "message", {
                content: "You're sending messages too fast! Please wait 10 seconds before sending another."
            })

            return;
        }
        this.cooldowns.set(socket.account.id, cooldown + 1);

        const chatMessage = {
            content: message,
            author: {
                name: socket.account.username,
                id: socket.account.id
            },
            time: Date.now()
        };

        this.sendChatMessage(chatMessage);
    }

    static clientMessage(socket, type, message) {
        switch (type) {
            case "authenticate":
                this.clientAuthMessage(socket, message);
                break;
            case "message":
                this.clientChatMessage(socket, message);
                break;
        }
    }
}

module.exports = ChatManager;