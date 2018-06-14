declare var apiDomain: string;

let thumbnailData = new Array<Thumbnail>();

interface Thumbnail {
    Art_ID: number;
    Art_Title: string;
    Art_Thumbnail: string;
    Art_Type: string;
    Art_Date: string;
    Art_Tags: Tag[];
}

interface Tag {
    Tag_ID: number;
    Tag_Title: string;
}

//initialize page
document.onreadystatechange = function () {
    let currentUrl = location.pathname + location.search;

    if ( this.readyState === "complete" ) {
        if ( this.location.pathname.includes( "Artwork" ) ) {
            let art_id = this.location.pathname.substring( this.location.pathname.lastIndexOf( "/" ) + 1 );
            loadViewer( art_id );
        }

        getThumbs().then( onfulfilled => {
            if ( new URLSearchParams( this.location.search ).get( "mode" ) === "tag" ) {
                toggleMode( "tag" );
                history.pushState( "", "", "/Gallery?mode=tag" );
            }
            else {
                ( document.querySelector( "#viewModeToggle" ) as HTMLElement ).onclick = () => toggleMode( "tag" );
                history.pushState( "", "", "/Gallery" );
                
            }
            history.pushState( "", "", currentUrl );
        } );
    }
};

//retrieves thumbnails from server
function getThumbs() {
    return new Promise( ( resolve ) => {
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "thumbs/artworks" );
        request.send();

        request.onload = function () {
            thumbnailData = JSON.parse( request.response );
            generateThumbnails();
            return resolve();
        }
    } );
}

//generates the page content
function generateThumbnails() {
    document.querySelector( "#artworks" ).innerHTML = "";

    thumbnailData.forEach( ( item ) => {
        let tags = new Array<string>();
        item.Art_Tags.forEach( ( tag ) => { tags.push( tag.Tag_Title ) } )

        document.querySelector( "#artworks" ).insertAdjacentHTML( "beforeend", `
            <article`
            + ` data-Art_ID="` + item.Art_ID
            + `" data-Art_Date="` + item.Art_Date
            + `" data-Art_Type="` + item.Art_Type
            + `" data-Art_Tags='` + JSON.stringify(tags)
            + `'>

                <div class="title" onclick="loadViewer(this.parentElement.dataset['art_id'])">`+ item.Art_Title + `</div>
                <img src="/Content/Artworks/Thumbnails/`+ item.Art_Thumbnail + `" />
            </article>
        `);
    } );
}

//hides artworks whose title or tags don't match the search value
function search( value: string ) {
    value = value.toLowerCase();
    let currentThumbnails: any = document.querySelectorAll( "article" );

    currentThumbnails.forEach( ( article: HTMLElement ) => {
        article.classList.remove( "searchFiltered" );

        let title = article.querySelector( ".title" ).innerHTML.toLowerCase();
        let tags = article.dataset["art_tags"];

        if ( !title.includes( value ) && !tags.includes( value )) {
            article.classList.add( "searchFiltered" );
        }
    } );
}

//only shows the selected types of art
function showType( sender: HTMLElement ) {
    document.querySelector( ".currentMode" ).classList.remove( "currentMode" );
    sender.classList.add( "currentMode" );

    let type = sender.innerText.trim();
    let currentThumbnails: any = document.querySelectorAll( "article" );

    currentThumbnails.forEach( ( article: HTMLElement ) => {
        article.classList.remove( "typeFiltered" );

        if ( type === "All" ) {
            return;
        }

        if ( article.dataset["art_type"] != type ) {
            article.classList.add( "typeFiltered" );
        }
    } )

    getTagListings();
    generateTagListings();
}

//sort by date
function sort( sortOrder ) {
    if ( sortOrder === "Newest" ) {
        thumbnailData.sort( ( a, b ) => {
            return Date.parse( b.Art_Date ) - Date.parse( a.Art_Date );
        } )
    }
    else {
        thumbnailData.sort( ( a, b ) => {
            return Date.parse( a.Art_Date ) - Date.parse( b.Art_Date );
        } )
    }

    generateThumbnails();
}

//change the view mode between art and tag
function toggleMode( modeTarget ) {
    let toggleButton: HTMLElement = document.querySelector( "#viewModeToggle" );

    if ( modeTarget === "tag" ) {
        document.querySelector( "#tags" ).classList.remove( "offMode" );
        document.querySelector( "#artworks" ).classList.add( "offMode" );
        toggleButton.innerHTML = "Switch to Art View";
        toggleButton.onclick = () => { toggleMode( "art" ) };
        history.pushState( "", "", "?mode=tag" );
        getTagListings();
        generateTagListings();
    }
    else {
        document.querySelector( "#artworks" ).classList.remove( "offMode" );
        document.querySelector( "#tags" ).classList.add( "offMode" );
        toggleButton.innerHTML = "Switch to Tag View";
        toggleButton.onclick = () => { toggleMode( "tag" ) };
        history.pushState( "", "", "/Gallery" );
    }

    ( document.querySelector( "#searchInput" ) as HTMLInputElement ).value = "";
    search("");
    document.querySelector( "#searchInput" ).classList.toggle( "hidden" );
    document.querySelector( "#sortLabel" ).classList.toggle( "hidden" );
    document.querySelector( "#sortModeSelect" ).classList.toggle( "hidden" );
}

/*
 * Tag View
 */

interface TagListing {
    tagTitle: string;
    artCount: number
}

let tagListings: Array<TagListing> = new Array();

//processes the tags in the currently existing artwork
function getTagListings() {
    tagListings = new Array();
    let artworks: NodeListOf<HTMLElement> = document.querySelectorAll( "#artworks article" );

    let counter = artworks.length;
    artworks.forEach( artwork => {
        if ( !artwork.classList.contains( "typeFiltered" ) ) {
            let tags = JSON.parse( artwork.dataset["art_tags"] );
            tags.forEach( tag => {
                let existingtags = tagListings.map( ( tagListing ) => { return tagListing.tagTitle } );

                if ( existingtags.includes( tag ) ) {
                    let listingToInc = tagListings.find( item => { return item.tagTitle === tag } );
                    listingToInc.artCount++;
                }
                else {
                    let newTag: TagListing = { tagTitle: tag, artCount: 1 };
                    tagListings.push( newTag );
                }
            } );
        }
        counter--;
        if ( counter === 0 ) {
            tagListings.sort( ( a, b ) => { return a.tagTitle.localeCompare( b.tagTitle ) } );
        }
    } );
}

//fills the tag section
function generateTagListings() {
    document.querySelector( "#tags" ).innerHTML = "";

    //generate the listing sections
    tagListings.forEach( listing => {
        document.querySelector( "#tags" ).insertAdjacentHTML( "beforeend", `
            <div class="tagListing" data-tag="`+ listing.tagTitle + `">
                <h3 onclick="toggleCollapse(this.nextElementSibling)">`+ listing.tagTitle + ` (` + listing.artCount + ` pieces)</h3>
                <section class="collapsed hidden"></section>
            </div>
        `);
    } );

    //populate the listing areas with the relevant artworks
    let listings: NodeListOf<HTMLElement> = document.querySelectorAll( ".tagListing" );
    let artworks: NodeListOf<HTMLElement> = document.querySelectorAll( "article" );

    artworks.forEach( artwork => {
        let art_tags: string[] = JSON.parse( artwork.dataset["art_tags"] );

        art_tags.forEach( tag => {
            listings.forEach( listing => {
                if ( listing.dataset["tag"] === tag ) {
                    listing.querySelector( "section" ).appendChild(artwork.cloneNode(true));
                }
            } );
        } );
    } );
}

function toggleCollapse( sender: HTMLElement ) {
    if ( sender.classList.contains( "collapsed" ) ) {
        sender.classList.remove( "hidden" );
        sender.clientHeight;
        sender.classList.toggle( "collapsed" );
    }
    else {
        sender.classList.toggle( "collapsed" );
        sender.addEventListener( "transitionend", function () { sender.classList.toggle( "hidden" ) }, { once: true } );
    }
}

/*
 * Image Viewer
 */

//loads the full artwork from the server, then resizes the image and viewer so everything fits in one window
function loadViewer( art_id ) {
    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "artworks/" + art_id );
    request.send();

    request.onload = () => {
        let response = JSON.parse( request.response );
        let image: HTMLImageElement = document.querySelector( "#imageViewer #artwork" );

        document.querySelector( "#imageViewer #title" ).innerHTML = response["Art_Title"];
        document.querySelector( "#imageViewer #uploadDate" ).innerHTML = new Date( response["Art_Date"] ).toLocaleString().split(",")[0];
        document.querySelector( "#imageViewer #description" ).innerHTML = response["Art_Description"];

        image.src = "/Content/Artworks/" + response["Art_Image"];
        image.onload = () => {
            image.removeAttribute( "style" );
            document.querySelector( "#imageViewer" ).classList.remove( "hidden" );

            image = document.querySelector( "#imageViewer #artwork" );
            let viewContainer: HTMLElement = document.querySelector( "#viewContainer" );
            let viewContainerHeight = Math.abs( viewContainer.scrollHeight - image.clientHeight )
                + parseInt( window.getComputedStyle( viewContainer )["padding-top"], 10 )
                + parseInt( window.getComputedStyle( viewContainer )["padding-bottom"], 10 );
            let maxHeight = window.innerHeight - viewContainerHeight - viewContainer.offsetTop * 2;

            image.style.maxHeight = maxHeight + "px";
            document.querySelector( "body" ).classList.add( "noScroll" );
        }
    }

    window.history.pushState( "", "", "/Gallery/Artwork/" + art_id );
}

function closeViewer() {
    document.querySelector( "#imageViewer" ).classList.add( "hidden" );
    document.querySelector( "body" ).classList.remove( "noScroll" );
    window.history.back();
}