const EasyMDE = require("easymde");

const easyMDE = new EasyMDE({
    toolbar: ["bold", "italic", "strikethrough", "heading", "heading-smaller", "heading-bigger", "heading-1", "heading-2", "heading-3", "code", "quote", "unordered-list", "ordered-list", "clean-block", "link", "image", "upload-image", "table", "horizontal-rule", "preview", "side-by-side", "fullscreen", "guide", "undo", "redo"]
});


// const { createCustomDropdowns, fixIframes } = require("../utils.js");

// fixIframes();
// createCustomDropdowns();

// const targetNode = document.querySelector("#textarea");


// const validElements = [
//     {
//         tag: ["b", "i", "u", "h1", "h2", "h3", "h4", "h5", "br", "div"],
//         attributes: []
//     }
// ];

// window.validElements = validElements;

// const observer = new MutationObserver((list, observer) => {

//     const els = [...targetNode.children];
//     els.forEach((el, index) => {
//         const [entry] = validElements.filter(e => {
//             if (e.tag instanceof Array) {
//                 return e.tag.includes(el.tagName.toLowerCase());
//             } else {
//                 return e.tag == el.tagName.toLowerCase();
//             }
//         });

//         console.log(el);
//         if (el.tagName == null) {
//             let newEl = document.createElement("div");
//             newEl.innerText = el.data;
//             targetNode.insertBefore(newEl, el);
//             el.remove();
//             return;
//         }
//         if (el.tagName == "DIV" && el.innerHTML == "<br>") {
//             return;
//         }

//         //Check if element is valid
//         if (entry || !el.tagName) {

//             //Remove attributes that aren't in the list
//             el.getAttributeNames().forEach(attr => {
//                 if (!entry.attributes.includes(attr)) {
//                     el.removeAttribute(attr);
//                 }
//             })
//         } else {
//             el.remove();
//         }
//     });
// })

// observer.observe(targetNode, {
//     attributes: true,
//     childList: true,
//     subtree: true,
//     characterData: true
// });