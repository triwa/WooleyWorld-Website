declare var apiDomain: string;
declare var YT;
var player;

//initialize page
document.onreadystatechange = function () {
    if ( this.readyState === "complete" ) {
        getAnimation()
            .then( () => {
                loadPlayer();
            } );
    }
};

//retrieves the animation information and fills the page
function getAnimation() {
    return new Promise( ( resolve ) => {
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + window.location.pathname );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send();

        request.onload = function () {
            let response = JSON.parse( request.response );

            document.querySelector( "#title" ).innerHTML = response.Anim_Title;
            document.querySelector( "#uploadDate" ).innerHTML = new Date( response.Anim_Date ).toLocaleString().split( "," )[0];;
            document.querySelector( "#description" ).innerHTML = response.Anim_Description;
            ( document.querySelector( "#videoContainer" ) as HTMLElement ).dataset["video"] = response.Anim_Video;

            return resolve();
        }
    } );
}

//https://developers.google.com/youtube/iframe_api_reference
function loadPlayer() {
    let videoContainer = ( document.querySelector( "#videoContainer" ) as HTMLElement );

    // This function creates an <iframe> (and YouTube player)
    // after the API code downloads.
    player = new YT.Player( 'player', {
        videoId: videoContainer.dataset["video"],
        playerVars: {
            autoplay: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onStateChange: onStateChange
        }
    } );

    //clear the player to stop youtubes related video crap when the video ends
    function onStateChange( event ) {
        if ( event.data === 0 ) {
            ( document.querySelector( "#player" ) as HTMLElement ).classList.toggle( "hidden" );
            loadReplayOptions();
        }
    }
}

//triggered when replay button is pressed
function replay() {
    ( document.querySelector( "#player" ) as HTMLElement ).classList.toggle( "hidden" );
    document.querySelector( "#replayOptions" ).classList.toggle( "hidden" );
    player.playVideo();
}

//lets user replay video or click to another animation
function loadReplayOptions() {
    document.querySelector( "#suggestedAnimations" ).innerHTML = "";

    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "animations/random?quantity=3" );
    request.setRequestHeader( "Content-Type", "application/json" );
    request.send();

    request.onload = function () {
        let response: any[] = JSON.parse( request.response );
        response.forEach( ( animThumb ) => {
            document.querySelector( "#suggestedAnimations" ).insertAdjacentHTML( "beforeend", `
                <article>
                    <a class="textContainer" href="/Animations/${animThumb.Anim_ID}" >
                        <h3 class="title">${animThumb.Anim_Title}</h3>
                    </a>
                    <img src = "/Content/Animations/Thumbnails/${animThumb.Anim_Thumbnail}"/>
                </article>
            ` );
        } );

        document.querySelector( "#replayOptions" ).classList.toggle( "hidden" );
    }
}