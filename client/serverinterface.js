
console.log("attach");
class ServerInterface {
    static async post(url, data) {
        return new Promise((res,rej) => {
            const req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if(req.readyState != XMLHttpRequest.DONE) return;

                if(req.status != 200) rej("Error with code "+req.status);

                let p = null;
                try {
                    p = JSON.parse(req.responseText);
                } catch(e){} finally {
                    res(p ?? req.responseText);
                }
            }

            req.open("POST", url, true);
            req.send(JSON.stringify(data));
        })
    }

    static async publishLevel(data) {
        return await this.post("/publish", data);
    }
}

module.exports = ServerInterface;