using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class AnimationsController : ApiController
    {
        private AnimationDBContext animations = new AnimationDBContext();
        private readonly string ThumbDirectory = HttpContext.Current.Server.MapPath("/") + "Content\\Animations\\Thumbnails\\";

        // GET: api/Animations
        public IHttpActionResult GetAnimation()
        {
            var response = animations.Animation.Select(i => new
            {
                i.Anim_ID,
                i.Anim_Title,
                i.Anim_Video,
                i.Anim_Thumbnail,
                i.Anim_Date,
                i.Anim_Description
            });

            return Json(response);
        }

        // GET: api/Animations/{anim_id}
        public IHttpActionResult GetAnimation(int id)
        {
            Animation selectedAnimation = animations.Animation.Find(id);

            if (selectedAnimation == null)
            {
                return NotFound();
            }

            object response = new
            {
                selectedAnimation.Anim_ID,
                selectedAnimation.Anim_Title,
                selectedAnimation.Anim_Video,
                selectedAnimation.Anim_Thumbnail,
                selectedAnimation.Anim_Date,
                selectedAnimation.Anim_Description
            };

            return Ok(response);
        }

        // GET
        [Route("api/Animations/random")]
        public IHttpActionResult GetRandomAnimationThumbs(int quantity)
        {
            object[] randomAnimations = animations.Animation.OrderBy(i => Guid.NewGuid())
                .Take(quantity)
                .Select(i => new { i.Anim_ID, i.Anim_Title, i.Anim_Thumbnail })
                .ToArray();
            return Ok(randomAnimations);
        }

        // PUT: api/Animations/{anim_id}
        [Authorize]
        public IHttpActionResult PutAnimation(int id, [FromBody]Animation animInput)
        {
            Animation animationToChange = animations.Animation.Where(i=>i.Anim_ID == id).First();

            animationToChange.Anim_Title = animInput.Anim_Title;
            animationToChange.Anim_Video = animInput.Anim_Video;
            animationToChange.Anim_Description = animInput.Anim_Description;

            //remove current thumbnail and store new one
            if (animInput.Anim_Thumbnail != null)
            {
                File.Delete(ThumbDirectory + animationToChange.Anim_Thumbnail);

                string thumbnailName = animInput.Anim_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-");

                animationToChange.Anim_Thumbnail = ImageUtil.StoreThumbnail(animInput.Anim_Thumbnail, thumbnailName, ThumbDirectory);
            }

            animations.SaveChanges();

            return Ok();
        }

        // POST: api/Animations
        [Authorize]
        public IHttpActionResult PostAnimation([FromBody]Animation animInput)
        {
            string thumbnailName = animInput.Anim_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-");

            //add animation to DB
            animInput.Anim_Date = DateTime.Now;
            animInput.Anim_Thumbnail = ImageUtil.StoreThumbnail(animInput.Anim_Thumbnail, thumbnailName, ThumbDirectory);

            animations.Animation.Add(animInput);
            animations.SaveChanges();

            return Json(animInput);
        }

        // DELETE: api/Animations/{anim_id}
        [Authorize]
        public IHttpActionResult DeleteAnimation(int id)
        {
            Animation animation = animations.Animation.Find(id);
            if (animation == null)
            {
                return NotFound();
            }

            //delete thumbnail from storage
            File.Delete(ThumbDirectory + animation.Anim_Thumbnail);

            //delete from db
            animations.Animation.Remove(animation);
            animations.SaveChanges();

            return Ok(animation);
        }

        private bool AnimationExists(int id)
        {
            return animations.Animation.Count(e => e.Anim_ID == id) > 0;
        }
    }
}