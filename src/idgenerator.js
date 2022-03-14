let db = null;

function createId() {
    let l = "";

    // Generates random strings of letters and numbers and append
    // them until level id reaches 100 or more chars in length
    while(l.length < 100) {
        l += btoa(`${Math.random()}`).replace(/=/g,"");
    }

    // Pick 32 of the letters and numbers
    let v = "";
    for(let i = 0; i < 32; i++) {
        const j = Math.floor(Math.random() * l.length);
        v += l[j];
    }
    
    return v;
}

async function checkExistence(id) {
    // Checks if level exists in the database
    let v = await db.get(`levels/${id}`);
    return !!v;
}

module.exports = async function*(dbInst) {
    db = dbInst;
    
    while(true) {
        let id = createId();
        while(await checkExistence(id)) id = createId();

        yield id;
    }
}