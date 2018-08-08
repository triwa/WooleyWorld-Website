declare var apiDomain: string;
//need this because the normal dragdata is unaccessible from dragover events.
var dragData: HTMLElement;

//initialize page
document.onreadystatechange = function () {
    if ( this.readyState === "complete" ) {
        CollapseSectionsBind();
        GetAnimations();
        GetFeatures();
        GetSeries();
        GetArtworks();
        //start artwork sections minimized
        document.querySelector( "#Still .collapseButton" ).dispatchEvent( new Event( "click" ) );
        document.querySelector( "#GIF .collapseButton" ).dispatchEvent( new Event( "click" ) );
        document.querySelector( "#Sketch .collapseButton" ).dispatchEvent( new Event( "click" ) );
    }
};


/*

Main Sections

*/

//fills the animations section
function GetAnimations() {
    document.querySelector( "#animations .content" ).innerHTML = "";

    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "thumbs/animations" );
    request.send();

    request.onload = function () {
        let response = JSON.parse( request.response );

        for ( let i = 0; i < response.length; i++ ) {
            document.querySelector( "#animations .content" ).insertAdjacentHTML( "beforeend", `
                <div class="tile" title="Edit Animation" data-Anim_ID="` + response[i].Anim_ID + `" onclick="OpenAnimationPanel('edit',this)">
                    <img src="../Content/Animations/Thumbnails/` + response[i].Anim_Thumbnail + `"
                        ondragstart="dragStart(event)"
                        ondragend="dragEnd(event)"
                    />
                    <label>` + response[i].Anim_Title + `</label>
                </div >
            `);
        }
    };
}

//fills the features section
function GetFeatures() {
    document.querySelector( "#features .content" ).innerHTML = "";

    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "features" );
    request.send();

    request.onload = function () {
        let response = JSON.parse( request.response );

        for ( let i = 0; i < response.length; i++ ) {
            document.querySelector( "#features .content" ).insertAdjacentHTML( "beforeend", `
                <div class="tile" title="Edit Animation" data-Anim_ID="` + response[i].Anim_ID + `" data-Feature_Order="` + response[i].Feature_Order + `">
                    <img src="../Content/Animations/Thumbnails/` + response[i].Anim_Thumbnail + `" 
                        ondragstart="dragStart(event)" 
                        ondragend="dragEnd(event)"
                    />
                    <label>` + response[i].Anim_Title + `</label>
                </div >
            `);
        }
    };
}

//fills the series section
function GetSeries() {
    document.querySelector( "#series .content" ).innerHTML = "";

    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "series" );
    request.send();

    request.onload = function () {
        let response = JSON.parse( request.response );

        for ( let i = 0; i < response.length; i++ ) {
            document.querySelector( "#series .content" ).insertAdjacentHTML( "beforeend", `
                <div class="tile" title="Edit Series" data-Series_ID="` + response[i].Series_ID + `"
                data-Series_Order="` + response[i].Series_Order + `" 
                onclick="OpenSeriesPanel('edit',this)">
                    <img src="../Content/Series/Thumbnails/` + response[i].Series_Thumbnail + `"
                    ondragstart="dragStart(event)" 
                    ondragend="dragEnd(event)"/>
                    <label>` + response[i].Series_Title + `</label>
                </div >
            `);
        }
    };
}

//fills the artwork section
function GetArtworks() {
    document.querySelectorAll( "#artwork .content .content" ).forEach(item => { item.innerHTML = "" });

    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "thumbs/artworks" );
    request.send();

    request.onload = function () {
        let response = JSON.parse( request.response );

        for ( let i = 0; i < response.length; i++ ) {
            document.querySelector( "#" + response[i].Art_Type + " .content" ).insertAdjacentHTML( "beforeend", `
                <div class="tile" title="Edit Artwork" data-Art_ID="` + response[i].Art_ID + `" 
                onclick="OpenArtworkPanel('edit', '` + response[i].Art_Type + `',this)">
                    <img src="../Content/Artworks/Thumbnails/` + response[i].Art_Thumbnail + `" 
                    draggable="false"/>
                    <label>` + response[i].Art_Title + `</label>
                </div >
            `);
        }
    };
}


/*
 
Features section
 
*/

function dragOverFeatures( event: DragEvent ) {
    event.preventDefault();
}

//drops the tile into the feature content area
function dropToFeatures( event: DragEvent ) {
    event.preventDefault();

    let tile = getElementFromDragData( event );
    tile.removeAttribute( "onclick" );
    tile.querySelector( "img" ).setAttribute( "ondragstart", "dragStart(event)" );
    tile.querySelector( "img" ).setAttribute( "ondragend", "dragEnd(event)" );

    //detects if there is a duplicate tile for later removal
    //this is done becuase removing the tile first would mess up the locations of the tiles from when the drop was
    let duplicateTile = document.querySelector( "#features .tile[data-anim_id='" + tile.dataset["anim_id"] + "']" );

    insertTile( event, tile, "features" );

    if ( duplicateTile != undefined ) {
        duplicateTile.remove();
    }

    updateFeatureOrders();
    putFeatures();
}

//updates the order data of the features
function updateFeatureOrders() {
    document.querySelectorAll( "#features .tile" ).forEach( ( feature: HTMLElement, index ) => {
        feature.dataset["feature_order"] = index.toString();
    } );
}

//upload changes to server
function putFeatures() {
    let featuresArray = new Array();
    document.querySelectorAll( "#features .tile" ).forEach( ( feature: HTMLElement ) => {
        featuresArray.push( {
            anim_id: feature.dataset["anim_id"],
            feature_order: feature.dataset["feature_order"]
        } );
    } );

    let request = new XMLHttpRequest();
    request.open( "PUT", apiDomain + "features" );
    request.setRequestHeader( "Content-Type", "application/json" );
    request.send( JSON.stringify( featuresArray ) );
}


/*

Side panels

*/

//toggles the cover and opens/closes the target panel
function SlidePanel( target ) {
    toggleCover();
    document.querySelector( "#" + target ).classList.toggle( "open" );

    let cover: HTMLElement = document.querySelector( "#cover" );

    if ( target === "animationPanel" ) {
        cover.onclick = function () {
            CloseAnimationPanel();
        };
    }
    if ( target === "artworkPanel" ) {
        cover.onclick = function () {
            CloseArtworkPanel();
        };
    }
    if ( target === "seriesPanel" ) {
        cover.onclick = function () {
            CloseSeriesPanel();
        };
    }
}


/*

Animation Panel

*/

//initializes and opens the animation side panel
function OpenAnimationPanel( mode, animation ) {
    //do nothing if another panel is open
    if (document.querySelector( "#cover" ).classList.contains("cover") ) {
        return;
    }

    let animationForm: any = document.querySelector( "#animationForm" );
    let deleteImg: HTMLElement = document.querySelector( "#animationPanel form .foot img" );
    
    if ( mode === "new" ) {
        animationForm.onsubmit = function () { SubmitNewAnimation(); return false; };
        document.querySelector( "#animationPanel .panelTitle" ).innerHTML = "New Animation";
        deleteImg.style.display = "none";
    }
    else {
        animationForm.onsubmit = function () { PutAnimation(); return false; };
        document.querySelector( "#animationPanel .panelTitle" ).innerHTML = "Edit Animation";
        deleteImg.style.display = "block";

        //load animationform with selected animation data
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "animations/" + animation.dataset["anim_id"] );
        request.send();

        request.onload = function () {
            let response = JSON.parse( request.response );

            animationForm.id.value = animation.dataset["anim_id"];
            animationForm.title.value = response.Anim_Title;
            animationForm.videoLink.value = response.Anim_Video;
            animationForm.description.value = response.Anim_Description;
            ( document.querySelector( "#animationForm label img" ) as HTMLImageElement ).src = "../Content/Animations/Thumbnails/" + response.Anim_Thumbnail;
        };
    }

    SlidePanel( "animationPanel" );
}

//closes and clears the animation side panel
function CloseAnimationPanel() {
    let animationForm: any = document.querySelector( "#animationForm" );

    SlidePanel( "animationPanel" );
    animationForm.reset();
    (document.querySelector( "#animationForm label img" ) as HTMLImageElement ).src = "/Content/CMS/thumbnail.png";
    document.querySelector( "#AnimationError" ).innerHTML = "";
    animationForm.thumbnail.previousElementSibling.removeAttribute( "style" );
}

//changes the animation thumbnail to the user selected input image
function updateAnimationThumbnail() {
    let animationForm: any = document.querySelector( "#animationForm" );

    let reader = new FileReader();
    reader.onload = function () {
        let image = new Image;
        image.src = reader.result;

        image.onload = function () {
            ( document.querySelector( "#animationForm label img" ) as HTMLImageElement ).src = image.src;
            let submitButton: HTMLButtonElement = document.querySelector( "#animationForm button" );

            //error if image is too big
            if ( image.width > 300 || image.height > 300 ) {
                document.querySelector( "#AnimationError" ).innerHTML = "!Max thumbnail size is 300x300!";
                animationForm.thumbnail.previousElementSibling.style.border = "5px solid red";
                submitButton.disabled = true;
            }
            else {
                document.querySelector( "#AnimationError" ).innerHTML = "";
                animationForm.thumbnail.previousElementSibling.removeAttribute( "style" );
                submitButton.disabled = false;
            }
        };
    };
    reader.readAsDataURL( animationForm.thumbnail.files[0] );
}

//POST new animation to the database
function SubmitNewAnimation() {
    let animationForm: any = document.querySelector( "#animationForm" );
    let imageString;

    let reader = new FileReader();
    reader.onload = function () {
        imageString = reader.result;

        document.querySelector( "#AnimationError" ).innerHTML = "";
        animationForm.thumbnail.previousElementSibling.removeAttribute( "style" );

        let request = new XMLHttpRequest();
        request.open( "POST", apiDomain + "animations" );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send( `{
                Anim_Description:"`+ animationForm.description.value + `",
                Anim_Thumbnail:"`+ imageString + `",
                Anim_Title:"`+ animationForm.title.value + `",
                Anim_Video:"`+ animationForm.videoLink.value + `"
            }`);

        request.onload = function () {
            GetAnimations();
            CloseAnimationPanel();
        };
    };
    reader.readAsDataURL( animationForm.thumbnail.files[0] );
}

//PUT animation information
function PutAnimation() {
    let animationForm: any = document.querySelector( "#animationForm" );

    if ( animationForm.thumbnail.files.length === 0 ) {
        let request = new XMLHttpRequest();
        request.open( "PUT", apiDomain + "animations/" + animationForm.id.value );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send( `{
                    Anim_Description:"`+ animationForm.description.value + `",
                    Anim_Title:"`+ animationForm.title.value + `",
                    Anim_Video:"`+ animationForm.videoLink.value + `"
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

            document.querySelector( "#AnimationError" ).innerHTML = "";
            animationForm.thumbnail.previousElementSibling.removeAttribute( "style" );

            let request = new XMLHttpRequest();
            request.open( "PUT", apiDomain + "animations/" + animationForm.id.value );
            request.setRequestHeader( "Content-Type", "application/json" );
            request.send( `{
                    Anim_Description:"`+ animationForm.description.value + `",
                    Anim_Thumbnail:"`+ imageString + `",
                    Anim_Title:"`+ animationForm.title.value + `",
                    Anim_Video:"`+ animationForm.videoLink.value + `"
                }`);

            request.onload = function () {
                GetAnimations();
                CloseAnimationPanel();
            };
        };
        reader.readAsDataURL( animationForm.thumbnail.files[0] );
    }
}

//DELETE animation from db and storage
function DeleteAnimation() {
    let animationForm: any = document.querySelector( "#animationForm" );

    let request = new XMLHttpRequest();
    request.open( "DELETE", apiDomain + "animations/" + animationForm.id.value );
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
function OpenArtworkPanel( mode, type, artwork ) {
    let artworkForm: any = document.querySelector( "#artworkForm" );
    let deleteButton: HTMLButtonElement = document.querySelector( "#artworkPanel form .foot img" );

    if ( mode === "new" ) {
        artworkForm.onsubmit = function () { SubmitNewArtwork(); return false; };
        artworkForm.type.value = type;
        document.querySelector( "#artworkPanel .panelTitle" ).innerHTML = "New " + type;
        deleteButton.style.display = "none";
    }
    else {
        artworkForm.onsubmit = function () { PutArtwork(); return false; };
        document.querySelector( "#artworkPanel .panelTitle" ).innerHTML = "Edit " + type;
        deleteButton.style.display = "block";

        //load artworkForm with selected artwork data
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "artworks/" + artwork.dataset["art_id"] );
        request.send();

        request.onload = function () {
            let response = JSON.parse( request.response );

            artworkForm.id.value = artwork.dataset["art_id"];
            artworkForm.title.value = response.Art_Title;
            artworkForm.type.value = response.Art_Type;
            artworkForm.description.value = response.Art_Description;
            (document.querySelector( "#artworkForm label img" ) as HTMLImageElement).src = "../Content/Artworks/" + response.Art_Image;

            //generate inputs for each existing tag
            document.querySelector( "#artworkForm .tags" ).innerHTML = "";
            response.tags.forEach( function ( item ) {
                document.querySelector( "#artworkForm .tags" ).insertAdjacentHTML( "beforeend", `
                    <div class="tagInput">
                        <input name="tag" placeholder="tag" data-tag_id="` + item.Tag_ID + `" value="` + item.Tag_Title + `" />
                        <img title="Delete tag" src="../Content/CMS/delete.png" onclick="removeTagInput(this)"/>
                    </div>
                `);
            } );

            generateTagInput();
        };
    }

    SlidePanel( "artworkPanel" );
}

//closes and clears the artwork side panel
function CloseArtworkPanel() {
    let artworkForm: any = document.querySelector( "#artworkForm" );

    SlidePanel( "artworkPanel" );
    artworkForm.reset();
    (document.querySelector( "#artworkForm label img" ) as HTMLImageElement).src = "/Content/CMS/artwork.png";
    document.querySelector( "#artworkForm .tags" ).innerHTML = "";
    generateTagInput();
    document.querySelector( "#ArtworkError" ).innerHTML = "";
    artworkForm.artwork.previousElementSibling.removeAttribute( "style" );
}

//adds a blank tag input and assigns event listener for dynamic tag input creation
function generateTagInput() {
    document.querySelector( "#artworkForm .tags" ).insertAdjacentHTML( "beforeend", `
                    <div class="tagInput">
                        <input name="tag" placeholder="tag"/>
                        <img title="Delete tag" src="../Content/CMS/delete.png" onclick="removeTagInput(this)"/>
                    </div>
                `);
    let currentTags = document.querySelectorAll( "#artworkForm .tagInput" );
    (currentTags[currentTags.length - 1].childNodes[1] as any).onfocus = function () { generateTagInput(); };
    try {
        (currentTags[currentTags.length - 2].childNodes[1] as any).onfocus = null;
    } catch ( e ) {null}
}

function removeTagInput( sender ) {
    let nodeToRemove = sender.parentElement;

    //move tag generator event listener to the previous tag input
    try {
        nodeToRemove.previousElementSibling.childNodes[1].onfocus = function () { generateTagInput(); };
    } catch ( e ) {null}

    nodeToRemove.parentElement.removeChild( nodeToRemove );

    if ( document.querySelectorAll( "#artworkForm .tagInput" ).length === 0 ) {
        generateTagInput();
    }
}

//changes the artwork thumbnail to the user selected input image
function updateArtworkThumbnail() {
    let artworkForm: any = document.querySelector( "#artworkForm" );

    let reader = new FileReader();
    reader.onload = function () {
        let image = new Image;
        image.src = reader.result;

        image.onload = function () {
            (document.querySelector( "#artworkForm label img" ) as HTMLImageElement).src = image.src;
        };
    };
    reader.readAsDataURL( artworkForm.artwork.files[0] );
}

//POST new artwork to the database
function SubmitNewArtwork() {
    let artworkForm: any = document.querySelector( "#artworkForm" );
    let imageString;

    let reader = new FileReader();
    reader.onload = function () {
        imageString = reader.result;

        document.querySelector( "#ArtworkError" ).innerHTML = "";
        artworkForm.artwork.previousElementSibling.removeAttribute( "style" );

        let tags = ParseTags();

        let request = new XMLHttpRequest();
        request.open( "POST", apiDomain + "artworks" );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send( JSON.stringify( {
            Art_Title: artworkForm.title.value,
            Art_Type: artworkForm.type.value,
            Art_Image: imageString,
            Art_Description: artworkForm.description.value,
            Art_Tags: tags
        } ) );

        request.onload = function () {
            GetArtworks();
            CloseArtworkPanel();
        };
    };
    reader.readAsDataURL( artworkForm.artwork.files[0] );
}

//PUT artwork information
function PutArtwork() {
    let artworkForm: any = document.querySelector( "#artworkForm" );
    let tags = ParseTags();

    //thumbnail not changed
    if ( artworkForm.artwork.files.length == 0 ) {
        let request = new XMLHttpRequest();
        request.open( "PUT", apiDomain + "artworks/" + artworkForm.id.value );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send( JSON.stringify( {
            Art_Title: artworkForm.title.value,
            Art_Type: artworkForm.type.value,
            Art_Description: artworkForm.description.value,
            Art_Tags: tags
        } ) );

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

            document.querySelector( "#ArtworkError" ).innerHTML = "";
            artworkForm.artwork.previousElementSibling.removeAttribute( "style" );

            let request = new XMLHttpRequest();
            request.open( "PUT", apiDomain + "artworks/" + artworkForm.id.value );
            request.setRequestHeader( "Content-Type", "application/json" );
            request.send( JSON.stringify( {
                Art_Title: artworkForm.title.value,
                Art_Type: artworkForm.type.value,
                Art_Image: imageString,
                Art_Description: artworkForm.description.value,
                Art_Tags: tags
            } ) );

            request.onload = function () {
                GetArtworks();
                CloseArtworkPanel();
            };
        };
        reader.readAsDataURL( artworkForm.artwork.files[0] );
    }
}

//parse tags for ajax request
function ParseTags() {
    let artworkForm: any = document.querySelector( "#artworkForm" );

    let tags = new Array();
    Array.from( artworkForm.tag ).forEach( item => {
        if ( (item as any).value != "" ) {
            tags.push( (item as any).value )
        }
    } );

    return tags;
}

//DELETE artwork from db and storage
function DeleteArtwork() {
    let artworkForm: any = document.querySelector( "#artworkForm" );
    let request = new XMLHttpRequest();
    request.open( "DELETE", apiDomain + "artworks/" + artworkForm.id.value );
    request.send();

    request.onload = function () {
        CloseArtworkPanel();
        GetArtworks();
    }
}


/*
 
 Series Panel

*/

interface seriesAnimation {
    Anim_id,
    AS_Order
}

interface series {
    Series_ID,
    Series_Title,
    Series_Thumbnail,
    Series_Description,
    Series_Order,
    Animation_Series: seriesAnimation[]
}

//updates the order data of the series
function updateSeriesOrders() {
    document.querySelectorAll( "#series .tile" ).forEach( ( feature: HTMLElement, index ) => {
        feature.dataset["series_order"] = index.toString();
    } );
}

function dragOverSeries( event: DragEvent ) {
    event.preventDefault();
}

function dropToSeries( event: DragEvent) {
    event.preventDefault();

    let tile = getElementFromDragData( event );
    tile.querySelector( "img" ).setAttribute( "ondragstart", "dragStart(event)" );
    tile.querySelector( "img" ).setAttribute( "ondragend", "dragEnd(event)" );

    //detects if there is a duplicate tile for later removal
    //this is done becuase removing the tile first would mess up the locations of the tiles from when the drop was
    let duplicateTile = document.querySelector( "#series .tile[data-series_id='" + tile.dataset["series_id"] + "']" );

    insertTile( event, tile, "series" );

    if ( duplicateTile != undefined ) {
        duplicateTile.remove();
    }

    updateSeriesOrders();
    putSeriesOrders();
}

//initializes and opens the series side panel
function OpenSeriesPanel( mode, series ) {
    let seriesForm: any = document.querySelector( "#seriesForm" );
    let deleteImg: HTMLElement = document.querySelector( "#seriesPanel form .foot img" );

    if ( mode === "new" ) {
        seriesForm.onsubmit = function () { SubmitNewSeries(); return false; };
        document.querySelector( "#seriesPanel .panelTitle" ).innerHTML = "New Series";
        deleteImg.style.display = "none";
    }
    else {
        seriesForm.onsubmit = function () { putSeries(); return false; };
        document.querySelector( "#seriesPanel .panelTitle" ).innerHTML = "Edit Series";
        deleteImg.style.display = "block";

        //load seriesform with selected series data
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "series/" + series.dataset["series_id"] );
        request.send();

        request.onload = function () {
            let response = JSON.parse( request.response );

            seriesForm.id.value = series.dataset["series_id"];
            seriesForm.title.value = response.Series_Title;
            seriesForm.description.value = response.Series_Description;
            seriesForm.order.value = response.Series_Order;
            ( document.querySelector( "#seriesForm .rightColumn label img" ) as HTMLImageElement ).src = "../Content/Series/Thumbnails/" + response.Series_Thumbnail;

            //fill in the animations section of the series
            ( response.animations as Array<any> ).forEach( ( seriesAnimation ) => {
                document.querySelector( "#seriesPanel .content" ).insertAdjacentHTML( "beforeend", `
                <div class="tile" data-Anim_ID="` + seriesAnimation.Anim_ID + `"
                data-AS_Order="` + seriesAnimation.AS_Order + `">
                    <img src="../Content/Animations/Thumbnails/` + seriesAnimation.Anim_Thumbnail + `" 
                        ondragstart="dragStart(event)" 
                        ondragend="dragEnd(event)"
                    />
                    <label>` + seriesAnimation.Anim_Title + `</label>
                </div >
            `);
            } );
        };
    }

    //don't let the series panel cover the animations section
    let animationsSection = document.querySelector( "#animations" );
    let furthestLeft = animationsSection.clientLeft + animationsSection.clientWidth;
    ( document.querySelector( "#seriesPanel" ) as HTMLElement )
        .style.maxWidth = ( window.innerWidth - furthestLeft - 40 ).toString() + "px";//40 to compensate for margins

    document.querySelector( "#animations" ).classList.add( "overCover" );

    SlidePanel( "seriesPanel" );
}

//closes and clears the artwork side panel
function CloseSeriesPanel() {
    let seriesForm: any = document.querySelector( "#seriesForm" );

    SlidePanel( "seriesPanel" );
    seriesForm.reset();
    ( document.querySelector( "#seriesForm .rightColumn label img" ) as HTMLImageElement ).src = "/Content/CMS/seriesThumbnail.png";
    document.querySelector( "#SeriesError" ).innerHTML = "";
    seriesForm.thumbnail.previousElementSibling.removeAttribute( "style" );
    document.querySelector( "#seriesAnimations .content" ).innerHTML = "";

    //wait for the cover to fade out before removing the z-index style on the animation section
    document.querySelector( "#cover" ).addEventListener( "transitionend", function _func( event ) {
        document.querySelector( "#animations" ).classList.remove( "overCover" );
        document.querySelector( "#cover" ).removeEventListener( "transitionend", _func );
    } );
}

function dragOverSeriesAnimations( event: DragEvent ) {
    event.preventDefault();
}

function dropToSeriesAnimations( event: DragEvent ) {
    event.preventDefault();

    let tile = getElementFromDragData( event );
    tile.removeAttribute( "onclick" );
    tile.querySelector( "img" ).setAttribute( "ondragstart", "dragStart(event)" );
    tile.querySelector( "img" ).setAttribute( "ondragend", "dragEnd(event)" );

    //detects if there is a duplicate tile for later removal
    //this is done becuase removing the tile first would mess up the locations of the tiles from when the drop was
    let duplicateTile = document.querySelector( "#seriesAnimations .tile[data-anim_id='" + tile.dataset["anim_id"] + "']" );

    insertTile( event, tile, "seriesAnimations" );

    if ( duplicateTile != undefined ) {
        duplicateTile.remove();
    }

    updateSeriesAnimationOrders();
}

//updates the order data of the seriesAnimations
function updateSeriesAnimationOrders() {
    document.querySelectorAll( "#seriesAnimations .tile" ).forEach( ( feature: HTMLElement, index ) => {
        feature.dataset["as_order"] = index.toString();
    } );
}

//changes the series thumbnail to the user selected input image
function updateSeriesThumbnail() {
    let seriesForm: any = document.querySelector( "#seriesForm" );

    let reader = new FileReader();
    reader.onload = function () {
        let image = new Image;
        image.src = reader.result;

        image.onload = function () {
            ( document.querySelector( "#seriesForm label img" ) as HTMLImageElement ).src = image.src;
            let submitButton: HTMLButtonElement = document.querySelector( "#seriesForm button" );

            //error if image is too big
            if ( image.width > 300 || image.height > 300 ) {
                document.querySelector( "#SeriesError" ).innerHTML = "!Max thumbnail size is 300x300!";
                seriesForm.thumbnail.previousElementSibling.style.border = "5px solid red";
                submitButton.disabled = true;
            }
            else {
                document.querySelector( "#SeriesError" ).innerHTML = "";
                seriesForm.thumbnail.previousElementSibling.removeAttribute( "style" );
                submitButton.disabled = false;
            }
        };
    };
    reader.readAsDataURL( seriesForm.thumbnail.files[0] );
}

//PUT series changes to server
function putSeries() {
    let seriesForm: any = document.querySelector( "#seriesForm" );

    let seriesToUpdate: series = {
        Series_ID: seriesForm.id.value,
        Series_Description: seriesForm.description.value,
        Series_Order: seriesForm.order.value,
        Series_Title: seriesForm.title.value,
        Series_Thumbnail: "",
        Animation_Series: new Array()
    }

    //fill the series animations array
    document.querySelectorAll( "#seriesAnimations .tile" ).forEach( ( seriesAnimation: HTMLElement ) => {
        let seriesAnimationToAdd: seriesAnimation = {
            Anim_id: seriesAnimation.dataset["anim_id"],
            AS_Order: seriesAnimation.dataset["as_order"]
        };
        seriesToUpdate.Animation_Series.push( seriesAnimationToAdd );
    } );

    //get the thumbnail if it was changed
    if ( seriesForm.thumbnail.files.length != 0 ) {
        let reader = new FileReader();
        reader.onload = function () {
            seriesToUpdate.Series_Thumbnail = reader.result;
            makeRequest();
        }
        reader.readAsDataURL( seriesForm.thumbnail.files[0] );
    } else {
        makeRequest();
    }

    //request
    function makeRequest() {
        let request = new XMLHttpRequest();
        request.open( "PUT", apiDomain + "series/" + seriesToUpdate.Series_ID );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send( JSON.stringify( seriesToUpdate ) );
        request.onload = function () {
            GetSeries();
        };
    }
}

//PUT series order to server
function putSeriesOrders() {
    let seriesArray = new Array();

    document.querySelectorAll( "#series .tile" ).forEach( (series:HTMLElement) => {
        seriesArray.push( {
            Series_Id: series.dataset["series_id"],
            Series_Order: series.dataset["series_order"]
        } );
    } );

    let request = new XMLHttpRequest();
    request.open( "PUT", apiDomain + "series" );
    request.setRequestHeader( "Content-Type", "application/json" );
    request.send( JSON.stringify( seriesArray ) );
}

//POST new animation to the database
function SubmitNewSeries() {
    let seriesForm: any = document.querySelector( "#seriesForm" );

    let seriesToCreate: series = {
        Series_ID: seriesForm.id.value,
        Series_Description: seriesForm.description.value,
        Series_Order: seriesForm.order.value,
        Series_Title: seriesForm.title.value,
        Series_Thumbnail: "",
        Animation_Series: new Array()
    }

    //fill the series animations array
    document.querySelectorAll( "#seriesAnimations .tile" ).forEach( ( seriesAnimation: HTMLElement ) => {
        let seriesAnimationToAdd: seriesAnimation = {
            Anim_id: seriesAnimation.dataset["anim_id"],
            AS_Order: seriesAnimation.dataset["as_order"]
        };
        seriesToCreate.Animation_Series.push( seriesAnimationToAdd );
    } );

    let reader = new FileReader();
    reader.onload = function () {
        seriesToCreate.Series_Thumbnail = reader.result;
        makeRequest();
    }
    reader.readAsDataURL( seriesForm.thumbnail.files[0] );

    //request
    function makeRequest() {
        let request = new XMLHttpRequest();
        request.open( "POST", apiDomain + "series" );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send( JSON.stringify( seriesToCreate ) );
        request.onload = function () {
            GetSeries();
            CloseSeriesPanel();
        };
    }
}

//DELETE animation from db and storage
function DeleteSeries() {
    let seriesForm: any = document.querySelector( "#seriesForm" );

    let request = new XMLHttpRequest();
    request.open( "DELETE", apiDomain + "series/" + seriesForm.id.value );
    request.send();

    request.onload = function () {
        GetSeries();
        CloseSeriesPanel();
    };
}


/*

Drag Events
 
*/

//highlights the drop areas when dragging an animation and sets dragdata
function dragStart( event: DragEvent ) {
    let tile = ( event.target as HTMLElement ).parentElement;

    event.dataTransfer.setDragImage( event.target as HTMLImageElement, 0, 0 );
    event.dataTransfer.setData( "text/html", tile.outerHTML );
    dragData = getElementFromDragData( event );

    //chrome is shitty and fires off every drag event when you start dragging
    //setTimeout is workaround
    setTimeout( () => {
        if ( document.querySelector( "#seriesPanel" ).classList.contains( "open" ) ) {
            document.querySelector( "#seriesAnimations" ).classList.add( "dropArea" );
            ( document.querySelector( "#seriesAnimations" ) as HTMLElement ).style.position = "static";

            //hide animations section when dragging a seriesAnimation
            if ( tile.dataset["as_order"] != undefined ) {
                document.querySelector( "#animations" ).classList.remove( "overCover" );
            }
        }
        //if dragging a series to reorder it
        else if ( tile.dataset["series_order"] != undefined ) {
            document.querySelector( "#series" ).classList.add( "dropArea" );
            toggleCover();
        }
        //if dragging an animation
        else {
            document.querySelector( "#features" ).classList.add( "dropArea" );
            toggleCover();
        }
    } );
}

function dragEnd( event: DragEvent ) {
    let tile = ( event.target as HTMLElement ).parentElement;

    if ( document.querySelector( "#seriesPanel" ).classList.contains( "open" ) ) {
        document.querySelector( "#seriesAnimations" ).classList.remove( "dropArea" );
        document.querySelector( "#seriesAnimations" ).removeAttribute( "style" );
        document.querySelector( "#animations" ).classList.add( "overCover" );
    }
    else if ( tile.dataset["series_order"] != undefined ) {
        document.querySelector( "#series" ).classList.remove( "dropArea" );
        toggleCover();
    }
    else {
        document.querySelector( "#features" ).classList.remove( "dropArea" );
        toggleCover();
    }
}

function dragOverCover( event: DragEvent ) {
    event.preventDefault();

    let tile = dragData;

    //only features and seriesAnimations can get dropped on the cover
    if ( tile.dataset["feature_order"] == undefined && tile.dataset["as_order"] == undefined ) {
        event.dataTransfer.dropEffect = "none";
    }
}

//features and seriesAnimations dropped over the cover are removed
function dropToCover( event: DragEvent ) {
    event.preventDefault();

    let tile = getElementFromDragData( event );

    //only features and seriesAnimations can be dropped on the cover
    if ( tile.dataset["feature_order"] != undefined ) {
        document.querySelector( "#features .tile[data-anim_id='" + tile.dataset["anim_id"] + "']" )
            .remove();
        updateFeatureOrders();
        putFeatures();
    }

    if ( tile.dataset["as_order"] != undefined ) {
        document.querySelector( "#seriesAnimations .tile[data-anim_id='" + tile.dataset["anim_id"] + "']" )
            .remove();
        updateSeriesAnimationOrders();
        putSeries();
    }
}


/*

Utils

*/

//binds click event to toggle between collpased and expanded sections
function CollapseSectionsBind() {
    document.querySelectorAll( ".collapseButton" ).forEach( i => i.addEventListener( "click", function ( event ) {
        this.parentElement.nextElementSibling.removeAttribute( "style" );
        this.parentElement.nextElementSibling.clientHeight;
        this.parentElement.nextElementSibling.classList.toggle( "collapsed" );
    } ) );

    document.querySelectorAll( ".content" ).forEach( i => i.addEventListener( "transitionend", function ( event ) {
        if ( this.classList.contains( "collapsed" ) ) {
            this.style.display = "none";
        }
    } ) );
}

function toggleCover() {
    document.querySelector( "#cover" ).classList.toggle( "cover" );
}

function getElementFromDragData( event: DragEvent ) {
    let tile = event.dataTransfer.getData( "text/html" );
    let parser = new DOMParser();
    return parser.parseFromString( tile, "text/html" ).querySelector( "body" ).firstElementChild as HTMLElement;
}

//this figures out where to place a tile relative to the other tiles in a dropzone
function insertTile( dropEvent: DragEvent, droppedTile:HTMLElement, tileSection: string ) {
    interface Point {
        x: number,
        y: number
    };

    interface Tile {
        id,
        centerPoint: Point,
        distanceFromDrop: number
    };

    let tiles: Tile[] = new Array();

    //calculates how close the other tiles are
    document.querySelectorAll( "#" + tileSection + " .tile" ).forEach( ( tile: HTMLElement ) => {
        let centerPoint: Point = {
            x: tile.getBoundingClientRect().left + tile.offsetWidth / 2,
            y: tile.getBoundingClientRect().top + tile.offsetHeight / 2
        };

        let tileToAdd: Tile = {
            id: undefined,
            centerPoint: centerPoint,
            distanceFromDrop:undefined
        };

        //if series tile was dropped
        if ( droppedTile.dataset["series_id"] != undefined ) {
            tileToAdd.id = tile.dataset["series_id"]
        }
        //otherwise its an animation tile
        else {
            tileToAdd.id = tile.dataset["anim_id"]
        }
        tileToAdd.centerPoint = centerPoint;
        tileToAdd.distanceFromDrop =
            Math.sqrt(
                Math.pow( ( dropEvent.clientX - tileToAdd.centerPoint.x ), 2 )
                + Math.pow( ( dropEvent.clientY - tileToAdd.centerPoint.y ), 2 )
            );

        tiles.push( tileToAdd );
    } );

    let closestTile;
    if ( tiles.length != 0 ) {
        closestTile = tiles.reduce( ( prevTile, currTile ) => {
            return prevTile.distanceFromDrop < currTile.distanceFromDrop ? prevTile : currTile;
        } );
    }
    //if there are no tiles
    else {
        document.querySelector( "#" + tileSection + " .content" )
            .insertAdjacentElement( "beforeend", droppedTile );
        return;
    }

    let closestTileElement;
    //if series tile was dropped
    if ( droppedTile.dataset["series_id"] != undefined ) {
        closestTileElement = document.querySelector( "#" + tileSection + " .tile[data-series_id ='" + closestTile.id + "']" );
    }
    //otherwise its an animation tile
    else {
        closestTileElement = document.querySelector( "#" + tileSection + " .tile[data-anim_id ='" + closestTile.id + "']" );
    }

    //insert to left side of closest tile
    if ( closestTile.centerPoint.x > dropEvent.clientX ) {
        closestTileElement.insertAdjacentElement( "beforebegin", droppedTile );
    }
    else {
        closestTileElement.insertAdjacentElement( "afterend", droppedTile );
    }
}