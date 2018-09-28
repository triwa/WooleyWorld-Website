declare var apiDomain: string;
var currentSeries: Series;
var player;

interface Series {
    Series_Title: string,
    Series_Description: string,
    animations: [
        {
            Anim_ID: number,
            Anim_Thumbnail: string,
            Anim_Title: string,
            Anim_Video: string,
            Anim_Description: string,
            AS_Order: number
        }
    ]
}

//initialize page
document.onreadystatechange = function () {
    if ( this.readyState === "complete" ) {
        getSeries()
            .then( () => {
                loadSeriesPlayer();
            } );
    }
};

//retrieves the series information and fills the page
function getSeries() {
    return new Promise( ( resolve ) => {
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + window.location.pathname );
        request.setRequestHeader( "Content-Type", "application/json" );
        request.send();

        request.onload = function () {
            currentSeries = JSON.parse( request.response );

            document.querySelector( "#title" ).innerHTML = currentSeries.Series_Title;
            document.querySelector( "#description" ).innerHTML = currentSeries.Series_Description;

            currentSeries.animations.forEach( ( animation ) => {
                document.querySelector( "#animations" ).insertAdjacentHTML( "beforeend", `
                    <article
                    data-Anim_ID="${animation.Anim_ID}" 
                    data-Anim_Video="${animation.Anim_Video}"
                    data-Anim_Description="${animation.Anim_Description}"
                    data-AS_Order="${animation.AS_Order}"
                    onclick="selectAnimation(this);">
                        <h3 class="title">${animation.Anim_Title}</h3>
                        <img src="/Content/Animations/Thumbnails/${animation.Anim_Thumbnail}" />
                    </article>
                `)
            } );

            return resolve();
        }
    } );
}

//https://developers.google.com/youtube/iframe_api_reference
function loadSeriesPlayer() {
    let videoContainer = ( document.querySelector( "#videoContainer" ) as HTMLElement );

    // This function creates an <iframe> (and YouTube player)
    // after the API code downloads.
    player = new YT.Player( 'player', {
        playerVars: {
            autoplay: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0
        },
        events: {
            onStateChange: onStateChange,
            onReady: onReady
        }
    } );

    //autstart the first animation in the series
    function onReady() {
        selectAnimation( ( document.querySelector( "article" ) as HTMLElement ) );
    }

    //play the next animation in the series.
    //when all done, clear the player to stop youtubes related video crap when the video ends
    function onStateChange( event ) {
        if ( event.data === 0 ) {
            let currentAnimationOrder = Number.parseInt(
                ( document.querySelector( ".selectedAnimation" ) as HTMLElement )
                    .dataset["as_order"]
            );
            let nextAnimation = document.querySelector( `article[data-as_order="${currentAnimationOrder + 1}"]` ) as HTMLElement;

            if ( nextAnimation !== null ) {
                selectAnimation( nextAnimation );
            }
            else {
                ( document.querySelector( "#player" ) as HTMLElement ).classList.toggle( "hidden" );
                loadSeriesReplayOptions();
            }
        }
    }
}

//when an animation is clicked.
//loads description, video into the player, styles animations section
function selectAnimation( animationArticle: HTMLElement ) {
    document.querySelector( "#replayOptions" ).classList.add( "hidden" );
    document.querySelector( "#player" ).classList.remove( "hidden" );

    let descriptionElement = document.querySelector( "#animationDescription" );
    descriptionElement.innerHTML = "";
    descriptionElement.innerHTML = animationArticle.dataset["anim_description"];

    player.loadVideoById( animationArticle.dataset["anim_video"] );
    player.playVideo();

    document.querySelectorAll( "article" ).forEach( ( article: HTMLElement ) => {
        article.classList.remove( "selectedAnimation" );
    } );
    animationArticle.classList.add( "selectedAnimation" );
}

//triggered when replay button is pressed
function replaySeries() {
    ( document.querySelector( "#player" ) as HTMLElement ).classList.toggle( "hidden" );
    document.querySelector( "#replayOptions" ).classList.toggle( "hidden" );
    selectAnimation( document.querySelector( "article" ) as HTMLElement );
}

//lets user replay video or click to another series
function loadSeriesReplayOptions() {
    document.querySelector( "#suggestedSeries" ).innerHTML = "";

    let request = new XMLHttpRequest();
    request.open( "GET", apiDomain + "series" );
    request.setRequestHeader( "Content-Type", "application/json" );
    request.send();

    request.onload = function () {
        let response: any[] = JSON.parse( request.response );
        response.forEach( ( seriesThumb ) => {
            document.querySelector( "#suggestedSeries" ).insertAdjacentHTML( "beforeend", `
                <article>
                    <a class="textContainer" href="/Series/${seriesThumb.Series_ID}" >
                        <h3 class="title">${seriesThumb.Series_Title}</h3>
                    </a>
                    <img src = "/Content/Series/Thumbnails/${seriesThumb.Series_Thumbnail}"/>
                </article>
            ` );
        } );

        document.querySelector( "#replayOptions" ).classList.toggle( "hidden" );
    }
}