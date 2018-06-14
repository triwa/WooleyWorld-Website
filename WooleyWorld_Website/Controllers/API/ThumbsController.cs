using System.Data;
using System.Linq;
using System.Web.Http;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class ThumbsController : ApiController
    {
        // GET: api/thumbs/animations||artworks
        //returns ID, title, and thumbnail of all animations. Ordered descending by date
        [Route("api/thumbs/animations")]
        public IHttpActionResult GetAnimations()
        {
            AnimationDBContext animations = new AnimationDBContext();
            return Json(animations.Animation
                    .OrderByDescending(i => i.Anim_Date)
                    .Select(i => new { i.Anim_ID, i.Anim_Title, i.Anim_Thumbnail }));
        }

        //returns ID, title, thumbnail, and type of all artworks. Ordered descending by date
        [Route("api/thumbs/artworks")]
        public IHttpActionResult GetArtworks()
        {
            ArtworkDBContext artworks = new ArtworkDBContext();

            return Json(artworks.Artwork
                    .OrderByDescending(i => i.Art_Date)
                    .Select(i => new
                    {
                        i.Art_ID,
                        i.Art_Title,
                        i.Art_Thumbnail,
                        i.Art_Type,
                        i.Art_Date,
                        Art_Tags = i.Artwork_Tag.Select(t => new { t.Tag_ID, t.Tag.Tag_Title })
                    }));
        }

        //returns ID, title, and thumbnail of all animations. Ordered descending by date
        [Route("api/thumbs/artworks/{type}")]
        public IHttpActionResult GetArtworksType(string type)
        {
            ArtworkDBContext artworks = new ArtworkDBContext();

            switch (type)
            {
                case "gifs":
                    return Json(artworks.Artwork
                            .Where(i => i.Art_Type.Equals("GIF"))
                            .OrderByDescending(i => i.Art_Date)
                            .Select(i => new { i.Art_ID, i.Art_Title, i.Art_Thumbnail }));
                case "sketches":
                    return Json(artworks.Artwork
                            .Where(i => i.Art_Type.Equals("Sketch"))
                            .OrderByDescending(i => i.Art_Date)
                            .Select(i => new { i.Art_ID, i.Art_Title, i.Art_Thumbnail }));
                case "stills":
                    return Json(artworks.Artwork
                            .Where(i => i.Art_Type.Equals("Still"))
                            .OrderByDescending(i => i.Art_Date)
                            .Select(i => new { i.Art_ID, i.Art_Title, i.Art_Thumbnail }));
            }

            return Json("bad type");
        }
    }
}