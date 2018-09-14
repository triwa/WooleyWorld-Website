using System.Linq;
using System.Web.Http;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class FeaturesController : ApiController
    {
        FeatureDBContext features = new FeatureDBContext();

        // GET: api/features
        //returns the id, title, thumbnail, and feature order of all features
        public IHttpActionResult Get()
        {
            return Json(features.Feature
                    .Select(i => new { i.Anim_ID, i.Animation.Anim_Title, i.Animation.Anim_Thumbnail, i.Feature_Order,i.Animation.Anim_Description })
                    .OrderBy(i => i.Feature_Order));
        }

        // PUT: api/features
        //updates the order of features or adds new ones
        [Authorize]
        public IHttpActionResult PutFeatures([FromBody]Feature[] featuresInput)
        {
            features.Database.ExecuteSqlCommand("delete from feature");

            foreach (Feature feature in featuresInput)
            {
                features.Feature.Add(feature);
            }

            features.SaveChanges();

            return Ok();
        }
    }
}
