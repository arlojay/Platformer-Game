const { fixIframes, cloneNode, parseTime, parseMarkdown } = require("../utils.js");

fixIframes();

function addComment(comment) {
    const {author, content, time, likes} = comment;

    const el = cloneNode("#comment-template");

    const elements = {
        author: el.querySelector(".author"),
        content: el.querySelector(".content"),
        time: el.querySelector("time"),
        likes: el.querySelector(".likes"),
        showMore: el.querySelector(".show-more-comment")
    }

    elements.author.textContent = author.name;
    elements.author.href = "/user/"+author.id;
    elements.content.innerHTML = parseMarkdown(content).innerHTML;
    elements.time.textContent = parseTime(time);
    elements.likes.textContent = likes;

    elements.showMore.addEventListener("click", e => {
        let dataset = elements.content.dataset;
        if(dataset.expanded == "true") {
            dataset.expanded = false;
            e.target.textContent = "Show More";
        } else {
            dataset.expanded = true;
            e.target;
            e.target.textContent = "Show Less";
        }
    })

    document.querySelector("#comments").appendChild(el);
}

addComment({
    author: {
        name: "arlojay",
        id: "90tj480t80w4ujfgw09eje09rtj"
    },
    content: `
**Koya the Phoenix** — *Today at 3:49 PM*
That grandpa stopped ***smoking btw***
I think
Florida man — Today at 3:49 PM
Germany did not invade Poland yes
archie — Today at 3:50 PM
smoking kills a lot of the company's customers each year
so thats why they came up with **chewing tobacco
Koya the Phoenix — Today at 3:50 PM
Why you just said that
archie — Today at 3:50 PM
and _more recently_, *__vapes__*
Florida man — Today at 3:50 PM
that's the point it gets rid of competition
Florida man — Today at 3:50 PM
it was a joke
archie — Today at 3:51 PM
they have to create new things if what they make kills tons of their customers each year if they want to grow as a business
Florida man — Today at 3:51 PM`,
    time: `${new Date()}`,
    likes: 2
});





const commentBox = document.querySelector("#write-comment");

//Find out if in iframe
if(window.parent == window) {
    commentBox.classList.remove("hidden");
} else {
    commentBox.remove();
    document.body.style.gridTemplateRows = "1fr";
}