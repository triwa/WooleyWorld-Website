declare var apiDomain: string;

namespace animationsPage {
    let animationsData = new Array<Animation>();
    let featuresData = new Array<Feature>();
    let seriesData = new Array<Series>();

    interface Animation {
        Anim_ID: number;
        Anim_Title: string;
        Anim_Thumbnail: string;
        Anim_Date: string;
        Anim_Description: string;
    }

    interface Feature {
        Anim_ID: number;
        Anim_Title: string;
        Anim_Thumbnail: string;
        Anim_Description: string;
        Feature_Order: number;
    }

    interface Series {
        Series_ID: number;
        Series_Title: string;
        Series_Thumbnail: string;
        Series_Description: string;
        Series_Order: string;
    }

    //initialize page
    document.onreadystatechange = function () {
        if ( this.readyState === "complete" ) {
            getFeatures();
            getSeries();
            getAnimations();
        }
    };

    //retrieves features from server
    function getFeatures() {
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "features" );
        request.send();

        request.onload = function () {
            featuresData = JSON.parse( request.response ) as Feature[];
            generateFeatures();
        }
    }

    //retrieves series from server
    function getSeries() {
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "series" );
        request.send();

        request.onload = function () {
            seriesData = JSON.parse( request.response ) as Series[];
            generateSeries();
        }
    }

    //retrieves animations from server
    function getAnimations() {
        let request = new XMLHttpRequest();
        request.open( "GET", apiDomain + "animations" );
        request.send();

        request.onload = function () {
            animationsData = JSON.parse( request.response ) as Animation[];
            generateAnimations();
        }
    }

    //generates the feature tiles
    function generateFeatures() {
        document.querySelector( "#features" ).innerHTML = "";

        featuresData.forEach( ( feature ) => {
            document.querySelector( "#features" ).insertAdjacentHTML( "beforeend", `
                <article data-Feature_Order="${feature.Feature_Order}">
                    <a class="linkWrapper" href="/Animations/${feature.Anim_ID}">
                        <h3 class="title">${feature.Anim_Title}</h3>
                        <img src="/Content/Animations/Thumbnails/${feature.Anim_Thumbnail}" />
                    </a>
                </article>
            `);
        } );
    }

    //generates the series tiles
    function generateSeries() {
        document.querySelector( "#series" ).innerHTML = "";

        seriesData.forEach( ( series ) => {
            document.querySelector( "#series" ).insertAdjacentHTML( "beforeend", `
                <article data-Series_Order="${series.Series_Order}">
                    <a class="linkWrapper" href="/Series/${series.Series_ID}">
                        <h3 class="title">${series.Series_Title}</h3>
                        <img src="/Content/Series/Thumbnails/${series.Series_Thumbnail}" />
                    </a>
                </article>
            `);
        } );
    }

    //generates the animation tiles
    function generateAnimations() {
        document.querySelector( "#animations" ).innerHTML = "";

        //generate years sections based on animation dates
        let animYears = [...new Set(
            animationsData.map( ( animation ) => new Date( animation.Anim_Date ).getFullYear() )
        )];
        animYears.sort( ( a, b ) => b - a );
        animYears.forEach( ( year ) => {
            document.querySelector( "#animations" ).insertAdjacentHTML( "beforeend", `
                <h2 class="year">${year.toString()}</h2>
                <div class="yearContainer" data-year="${year.toString()}"></div>
            `);
        } );

        //insert animations to relevant year section
        animationsData.forEach( ( animation ) => {
            document.querySelector( `.yearContainer[data-year="${new Date( animation.Anim_Date ).getFullYear().toString()}"]` )
                .insertAdjacentHTML( "beforeend", `
                    <article>
                        <a class="textContainer" href="/Animations/${animation.Anim_ID}" >
                            <h3 class="title">${animation.Anim_Title}</h3>
                        </a>
                        <img src = "/Content/Animations/Thumbnails/${animation.Anim_Thumbnail}"/>
                    </article>
                `)
        } );
    }
}