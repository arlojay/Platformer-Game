
console.log("attach");
class ServerInterface {
    static async post(url, data) {
        let res = await fetch(url, {
            method: "post",
            body: JSON.stringify(data)
        });

        let resBody = await res.text();
        try {
            resBody = JSON.parse(resBody);
        } catch (e) { }

        const { status } = res;
        return { body: resBody, status };
    }
    static async get(url, query) {
        let q = [];
        for (let key of Object.keys(query)) {
            q.push(`${key}=${query[key]}`);
        }

        if (query) url += "?" + q.join("&");

        let res = await fetch(url, {
            method: "get"
        });

        let resBody = await res.text();
        try {
            resBody = JSON.parse(resBody);
        } catch (e) { }

        const { status } = res;
        return { body: resBody, status };
    }

    static async publishLevel(data) {
        return await this.post("/publish", data);
    }

    static async getLevel(id) {
        return await this.get("/level", { id });
    }
}

module.exports = ServerInterface;