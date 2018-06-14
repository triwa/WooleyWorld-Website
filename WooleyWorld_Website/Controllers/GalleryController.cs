using System.Web.Mvc;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers
{
    public class GalleryController : Controller
    {
        // GET: Gallery
        public ActionResult Gallery()
        {
            return View();
        }

        //GET: Gallery/Artwork/{Artwork_ID}
        public ActionResult Artwork(int id)
        {
            ArtworkDBContext artworks = new ArtworkDBContext();

            if (artworks.Artwork.Find(id) == null)
            {
                return RedirectToAction("Gallery");
            }

            return View("Gallery");
        }
    }
}