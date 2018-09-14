using System.Web.Mvc;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers
{
    public class AnimationsController : Controller
    {
        // GET: Animations
        public ActionResult Animations()
        {
            return View();
        }

        //GET: Animations/{Animation_ID}
        public ActionResult Animation(int id)
        {
            AnimationDBContext animations = new AnimationDBContext();

            if (animations.Animation.Find(id) == null)
            {
                return RedirectToAction("Animations");
            }

            return View("Animations");
        }
    }
}