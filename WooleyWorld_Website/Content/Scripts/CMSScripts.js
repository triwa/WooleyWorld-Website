//initialize page
document.onreadystatechange = function () {
    if (this.readyState === "complete") {
        CollapsePanelsBind();
        GetAnimations();
        GetFeatures();
        GetSeries();
        GetArtworks();
        //start artwork sections minimized
        document.querySelector("#Still .collapseButton").dispatchEvent(new Event("click"));
        document.querySelector("#GIF .collapseButton").dispatchEvent(new Event("click"));
        document.querySelector("#Sketch .collapseButton").dispatchEvent(new Event("click"));
    }
};
/*

Main Sections

*/
//binds click event to toggle between collpased and expanded panels
function CollapsePanelsBind() {
    document.querySelectorAll(".collapseButton").forEach(i => i.addEventListener("click", function (event) {
        this.parentElement.nextElementSibling.removeAttribute("style");
        this.parentElement.nextElementSibling.clientHeight;
        this.parentElement.nextElementSibling.classList.toggle("collapsed");
    }));
    document.querySelectorAll(".content").forEach(i => i.addEventListener("transitionend", function (event) {
        if (this.classList.contains("collapsed")) {
            this.style.display = "none";
        }
    }));
}
//fills the animations section
function GetAnimations() {
    document.querySelector("#animations .content").innerHTML = "";
    let request = new XMLHttpRequest();
    request.open("GET", apiDomain + "thumbs/animations");
    request.send();
    request.onload = function () {
        let response = JSON.parse(request.response);
        for (let i = 0; i < response.length; i++) {
            document.querySelector("#animations .content").insertAdjacentHTML("beforeend", `
                <div class="tile" title="Edit Animation" data-Anim_ID="` + response[i].Anim_ID + `" onclick="OpenAnimationPanel('edit',this)">
                    <img src="../Content/Animations/Thumbnails/` + response[i].Anim_Thumbnail + `" />
                    <label>` + response[i].Anim_Title + `</label>
                </div >
            `);
        }
    };
}
//fills the features section
function GetFeatures() {
    document.querySelector("#features .content").innerHTML = "";
    let request = new XMLHttpRequest();
    request.open("GET", apiDomain + "features");
    request.send();
    request.onload = function () {
        let response = JSON.parse(request.response);
        for (let i = 0; i < response.length; i++) {
            document.querySelector("#features .content").insertAdjacentHTML("beforeend", `
                <div class="tile" title="Edit Animation" data-Anim_ID="` + response[i].Anim_ID + `" data-Feature_Order="` + response[i].Feature_Order + `">
                    <img src="../Content/Animations/Thumbnails/` + response[i].Anim_Thumbnail + `" />
                    <label>` + response[i].Anim_Title + `</label>
                </div >
            `);
        }
    };
}
//fills the series section
function GetSeries() {
    document.querySelector("#series .content").innerHTML = "";
    let request = new XMLHttpRequest();
    request.open("GET", apiDomain + "series");
    request.send();
    request.onload = function () {
        let response = JSON.parse(request.response);
        for (let i = 0; i < response.length; i++) {
            document.querySelector("#series .content").insertAdjacentHTML("beforeend", `
                <div class="tile" title="Edit Series" data-Series_ID="` + response[i].Series_ID + `" data-Series_Order="` + response[i].Series_Order + `">
                    <img src="../Content/Series/Thumbnails/` + response[i].Series_Thumbnail + `" />
                    <label>` + response[i].Series_Title + `</label>
                </div >
            `);
        }
    };
}
//fills the artwork section
function GetArtworks() {
    document.querySelectorAll("#artwork .content .content").forEach(item => { item.innerHTML = ""; });
    let request = new XMLHttpRequest();
    request.open("GET", apiDomain + "thumbs/artworks");
    request.send();
    request.onload = function () {
        let response = JSON.parse(request.response);
        for (let i = 0; i < response.length; i++) {
            document.querySelector("#" + response[i].Art_Type + " .content").insertAdjacentHTML("beforeend", `
                <div class="tile" title="Edit Artwork" data-Art_ID="` + response[i].Art_ID + `" onclick="OpenArtworkPanel('edit', '` + response[i].Art_Type + `',this)">
                    <img src="../Content/Artworks/Thumbnails/` + response[i].Art_Thumbnail + `" />
                    <label>` + response[i].Art_Title + `</label>
                </div >
            `);
        }
    };
}
/*

Side panels

*/
//toggles the cover and opens/closes the target panel
function SlidePanel(target) {
    document.querySelector("#cover").classList.toggle("cover");
    document.querySelector("#" + target).classList.toggle("open");
    let cover = document.querySelector("#cover");
    if (target === "animationPanel") {
        cover.onclick = function () {
            CloseAnimationPanel();
        };
    }
    if (target === "artworkPanel") {
        cover.onclick = function () {
            CloseArtworkPanel();
        };
    }
}
/*

Animation Panel

*/
//initializes and opens the animation side panel
function OpenAnimationPanel(mode, animation) {
    let animationForm = document.querySelector("#animationForm");
    let deleteImg = document.querySelector("#animationPanel form .foot img");
    if (mode === "new") {
        animationForm.onsubmit = function () { SubmitNewAnimation(); return false; };
        document.querySelector("#animationPanel .panelTitle").innerHTML = "New Animation";
        deleteImg.style.display = "none";
    }
    else {
        animationForm.onsubmit = function () { PutAnimation(); return false; };
        document.querySelector("#animationPanel .panelTitle").innerHTML = "Edit Animation";
        deleteImg.style.display = "block";
        //load animationform with selected animation data
        let request = new XMLHttpRequest();
        request.open("GET", apiDomain + "animations/" + animation.dataset["anim_id"]);
        request.send();
        request.onload = function () {
            let response = JSON.parse(request.response);
            animationForm.id.value = animation.dataset["anim_id"];
            animationForm.title.value = response.Anim_Title;
            animationForm.videoLink.value = response.Anim_Video;
            animationForm.description.value = response.Anim_Description;
            document.querySelector("#animationForm label img").src = "../Content/Animations/Thumbnails/" + response.Anim_Thumbnail;
        };
    }
    SlidePanel("animationPanel");
}
//closes and clears the animation side panel
function CloseAnimationPanel() {
    let animationForm = document.querySelector("#animationForm");
    SlidePanel("animationPanel");
    animationForm.reset();
    document.querySelector("#animationForm label img").src = "/Content/CMS/thumbnail.png";
    document.querySelector("#AnimationError").innerHTML = "";
    animationForm.thumbnail.previousElementSibling.removeAttribute("style");
}
//changes the animation thumbnail to the user selected input image
function updateAnimationThumbnail() {
    let animationForm = document.querySelector("#animationForm");
    let reader = new FileReader();
    reader.onload = function () {
        let image = new Image;
        image.src = reader.result;
        image.onload = function () {
            document.querySelector("#animationForm label img").src = image.src;
            let submitButton = document.querySelector("#animationForm button");
            //error if image is too big
            if (image.width > 300 || image.height > 300) {
                document.querySelector("#AnimationError").innerHTML = "!Max thumbnail size is 300x300!";
                animationForm.thumbnail.previousElementSibling.style.border = "5px solid red";
                submitButton.disabled = true;
            }
            else {
                document.querySelector("#AnimationError").innerHTML = "";
                animationForm.thumbnail.previousElementSibling.removeAttribute("style");
                submitButton.disabled = false;
            }
        };
    };
    reader.readAsDataURL(animationForm.thumbnail.files[0]);
}
//POST new animation to the database
function SubmitNewAnimation() {
    let animationForm = document.querySelector("#animationForm");
    let imageString;
    let reader = new FileReader();
    reader.onload = function () {
        imageString = reader.result;
        document.querySelector("#AnimationError").innerHTML = "";
        animationForm.thumbnail.previousElementSibling.removeAttribute("style");
        let request = new XMLHttpRequest();
        request.open("POST", apiDomain + "animations");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(`{
                Anim_Description:"` + animationForm.description.value + `",
                Anim_Thumbnail:"` + imageString + `",
                Anim_Title:"` + animationForm.title.value + `",
                Anim_Video:"` + animationForm.videoLink.value + `"
            }`);
        request.onload = function () {
            GetAnimations();
            CloseAnimationPanel();
        };
    };
    reader.readAsDataURL(animationForm.thumbnail.files[0]);
}
//PUT animation information
function PutAnimation() {
    let animationForm = document.querySelector("#animationForm");
    if (animationForm.thumbnail.files.length === 0) {
        let request = new XMLHttpRequest();
        request.open("PUT", apiDomain + "animations/" + animationForm.id.value);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(`{
                    Anim_Description:"` + animationForm.description.value + `",
                    Anim_Title:"` + animationForm.title.value + `",
                    Anim_Video:"` + animationForm.videoLink.value + `"
                }`);
        request.onload = function () {
            GetAnimations();
            CloseAnimationPanel();
        };
    }
    //when thumbnail is changed
    else {
        let imageString;
        let reader = new FileReader();
        reader.onload = function () {
            imageString = reader.result;
            document.querySelector("#AnimationError").innerHTML = "";
            animationForm.thumbnail.previousElementSibling.removeAttribute("style");
            let request = new XMLHttpRequest();
            request.open("PUT", apiDomain + "animations/" + animationForm.id.value);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(`{
                    Anim_Description:"` + animationForm.description.value + `",
                    Anim_Thumbnail:"` + imageString + `",
                    Anim_Title:"` + animationForm.title.value + `",
                    Anim_Video:"` + animationForm.videoLink.value + `"
                }`);
            request.onload = function () {
                GetAnimations();
                CloseAnimationPanel();
            };
        };
        reader.readAsDataURL(animationForm.thumbnail.files[0]);
    }
}
//DELETE animation from db and storage
function DeleteAnimation() {
    let animationForm = document.querySelector("#animationForm");
    let request = new XMLHttpRequest();
    request.open("DELETE", apiDomain + "animations/" + animationForm.id.value);
    request.send();
    request.onload = function () {
        CloseAnimationPanel();
        GetAnimations();
    };
}
/*

Artwork Panel

*/
//initializes and opens the artwork side panel
function OpenArtworkPanel(mode, type, artwork) {
    let artworkForm = document.querySelector("#artworkForm");
    let deleteButton = document.querySelector("#artworkPanel form .foot img");
    if (mode === "new") {
        artworkForm.onsubmit = function () { SubmitNewArtwork(); return false; };
        artworkForm.type.value = type;
        document.querySelector("#artworkPanel .panelTitle").innerHTML = "New " + type;
        deleteButton.style.display = "none";
    }
    else {
        artworkForm.onsubmit = function () { PutArtwork(); return false; };
        document.querySelector("#artworkPanel .panelTitle").innerHTML = "Edit " + type;
        deleteButton.style.display = "block";
        //load artworkForm with selected artwork data
        let request = new XMLHttpRequest();
        request.open("GET", apiDomain + "artworks/" + artwork.dataset["art_id"]);
        request.send();
        request.onload = function () {
            let response = JSON.parse(request.response);
            artworkForm.id.value = artwork.dataset["art_id"];
            artworkForm.title.value = response.Art_Title;
            artworkForm.type.value = response.Art_Type;
            artworkForm.description.value = response.Art_Description;
            document.querySelector("#artworkForm label img").src = "../Content/Artworks/" + response.Art_Image;
            //generate inputs for each existing tag
            document.querySelector("#artworkForm .tags").innerHTML = "";
            response.tags.forEach(function (item) {
                document.querySelector("#artworkForm .tags").insertAdjacentHTML("beforeend", `
                    <div class="tagInput">
                        <input name="tag" placeholder="tag" data-tag_id="` + item.Tag_ID + `" value="` + item.Tag_Title + `" />
                        <img title="Delete tag" src="../Content/CMS/delete.png" onclick="removeTagInput(this)"/>
                    </div>
                `);
            });
            generateTagInput();
        };
    }
    SlidePanel("artworkPanel");
}
//closes and clears the artwork side panel
function CloseArtworkPanel() {
    let artworkForm = document.querySelector("#artworkForm");
    SlidePanel("artworkPanel");
    artworkForm.reset();
    document.querySelector("#artworkForm label img").src = "/Content/CMS/artwork.png";
    document.querySelector("#artworkForm .tags").innerHTML = "";
    generateTagInput();
    document.querySelector("#ArtworkError").innerHTML = "";
    artworkForm.artwork.previousElementSibling.removeAttribute("style");
}
//adds a blank tag input and assigns event listener for dynamic tag input creation
function generateTagInput() {
    document.querySelector("#artworkForm .tags").insertAdjacentHTML("beforeend", `
                    <div class="tagInput">
                        <input name="tag" placeholder="tag"/>
                        <img title="Delete tag" src="../Content/CMS/delete.png" onclick="removeTagInput(this)"/>
                    </div>
                `);
    let currentTags = document.querySelectorAll("#artworkForm .tagInput");
    currentTags[currentTags.length - 1].childNodes[1].onfocus = function () { generateTagInput(); };
    try {
        currentTags[currentTags.length - 2].childNodes[1].onfocus = null;
    }
    catch (e) {
        null;
    }
}
function removeTagInput(sender) {
    let nodeToRemove = sender.parentElement;
    //move tag generator event listener to the previous tag input
    try {
        nodeToRemove.previousElementSibling.childNodes[1].onfocus = function () { generateTagInput(); };
    }
    catch (e) {
        null;
    }
    nodeToRemove.parentElement.removeChild(nodeToRemove);
    if (document.querySelectorAll("#artworkForm .tagInput").length === 0) {
        generateTagInput();
    }
}
//changes the artwork thumbnail to the user selected input image
function updateArtworkThumbnail() {
    let artworkForm = document.querySelector("#artworkForm");
    let reader = new FileReader();
    reader.onload = function () {
        let image = new Image;
        image.src = reader.result;
        image.onload = function () {
            document.querySelector("#artworkForm label img").src = image.src;
        };
    };
    reader.readAsDataURL(artworkForm.artwork.files[0]);
}
//POST new artwork to the database
function SubmitNewArtwork() {
    let artworkForm = document.querySelector("#artworkForm");
    let imageString;
    let reader = new FileReader();
    reader.onload = function () {
        imageString = reader.result;
        document.querySelector("#ArtworkError").innerHTML = "";
        artworkForm.artwork.previousElementSibling.removeAttribute("style");
        let tags = ParseTags();
        let request = new XMLHttpRequest();
        request.open("POST", apiDomain + "artworks");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify({
            Art_Title: artworkForm.title.value,
            Art_Type: artworkForm.type.value,
            Art_Image: imageString,
            Art_Description: artworkForm.description.value,
            Art_Tags: tags
        }));
        request.onload = function () {
            GetArtworks();
            CloseArtworkPanel();
        };
    };
    reader.readAsDataURL(artworkForm.artwork.files[0]);
}
//PUT artwork information
function PutArtwork() {
    let artworkForm = document.querySelector("#artworkForm");
    let tags = ParseTags();
    //thumbnail not changed
    if (artworkForm.artwork.files.length == 0) {
        let request = new XMLHttpRequest();
        request.open("PUT", apiDomain + "artworks/" + artworkForm.id.value);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify({
            Art_Title: artworkForm.title.value,
            Art_Type: artworkForm.type.value,
            Art_Description: artworkForm.description.value,
            Art_Tags: tags
        }));
        request.onload = function () {
            GetArtworks();
            CloseArtworkPanel();
        };
    }
    //when thumbnail is changed
    else {
        let imageString;
        let reader = new FileReader();
        reader.onload = function () {
            imageString = reader.result;
            document.querySelector("#ArtworkError").innerHTML = "";
            artworkForm.artwork.previousElementSibling.removeAttribute("style");
            let request = new XMLHttpRequest();
            request.open("PUT", apiDomain + "artworks/" + artworkForm.id.value);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify({
                Art_Title: artworkForm.title.value,
                Art_Type: artworkForm.type.value,
                Art_Image: imageString,
                Art_Description: artworkForm.description.value,
                Art_Tags: tags
            }));
            request.onload = function () {
                GetArtworks();
                CloseArtworkPanel();
            };
        };
        reader.readAsDataURL(artworkForm.artwork.files[0]);
    }
}
//parse tags for ajax request
function ParseTags() {
    let artworkForm = document.querySelector("#artworkForm");
    let tags = new Array();
    Array.from(artworkForm.tag).forEach(item => {
        if (item.value != "") {
            tags.push(item.value);
        }
    });
    return tags;
}
//DELETE artwork from db and storage
function DeleteArtwork() {
    let artworkForm = document.querySelector("#artworkForm");
    let request = new XMLHttpRequest();
    request.open("DELETE", apiDomain + "artworks/" + artworkForm.id.value);
    request.send();
    request.onload = function () {
        CloseArtworkPanel();
        GetArtworks();
    };
}
//# sourceMappingURL=CMSScripts.js.map