let db = null;

function createId(length) {
    length ??= 32;
    let l = "";

    // Generates random strings of letters and numbers and append
    // them until level id reaches 100 or more chars in length
    while (l.length < length * 4) {
        l += btoa(`${Math.random()}`).replace(/=/g, "");
    }

    // Pick 32 of the letters and numbers
    let v = "";
    for (let i = 0; i < length; i++) {
        const j = Math.floor(Math.random() * l.length);
        v += l[j];
    }

    return v;
}

async function checkLevelExistence(id) {
    // Checks if level exists in the database
    let v = await db.get(`levels/${id}`);
    return !!v;
}
async function checkAccountExistence(id) {
    // Checks if level exists in the database
    let v = await db.get(`accounts/${id}`);
    return !!v;
}

module.exports = {
    generator: async function* (dbInst, mode) {
        mode ??= "level";
        db = dbInst;

        while (true) {
            let id = createId();
            if (mode == "level") while (await checkLevelExistence(id)) id = createId(32);
            if (mode == "account") while (await checkAccountExistence(id)) id = createId(16);

            yield id;
        }
    },
    createId
};