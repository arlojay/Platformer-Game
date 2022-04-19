const { createCustomDropdowns, fixIframes } = require("../utils.js");

fixIframes();
createCustomDropdowns();

const targetNode = document.querySelector("#textarea");


const validElements = [
    {
        tag: "b",
        attributes: []
    },
    {
        tag: "i",
        attributes: []
    },
    {
        tag: "u",
        attributes: []
    }
];

window.validElements = validElements;

const observer = new MutationObserver((list, observer) => {

    const els = [...targetNode.children];
    els.forEach(el => {
        const [entry] = validElements.filter(e=>e.tag==el.tagName.toLowerCase());

        console.log(entry);
        
        //Check if element is valid
        if(entry || !el.tagName) {

            //Remove attributes that aren't in the list
            el.getAttributeNames().forEach(attr => {
                if(!entry.attributes.includes(attr)) {
                    el.removeAttribute(attr);
                }
            })
        } else {
            el.remove();
        }
    });
})

observer.observe(targetNode, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
});