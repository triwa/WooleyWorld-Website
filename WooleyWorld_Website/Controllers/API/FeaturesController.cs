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
                    .Select(i => new { i.Anim_ID, i.Anim_Title, i.Anim_Thumbnail, i.Feature_Order })
                    .OrderBy(i => i.Feature_Order));
        }
    }
}
