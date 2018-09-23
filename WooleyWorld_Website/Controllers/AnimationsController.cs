using System.Web.Mvc;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers
{
    public class AnimationsController : Controller
    {
        // GET: Animations
        [Route("Animations")]
        public ActionResult Animations()
        {
            return View();
        }
        
        [Route("Animations/{id:int}")]
        public ActionResult Animations(int id)
        {
            AnimationDBContext animations = new AnimationDBContext();
            Animation selectedAnimation = animations.Animation.Find(id);

            if (animations.Animation.Find(id) == null)
            {
                return RedirectToAction("Animations");
            }

            ViewBag.Animation_Title = selectedAnimation.Anim_Title;

            return View("AnimationView");
        }
    }
}