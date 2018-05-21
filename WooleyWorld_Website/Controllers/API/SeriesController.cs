using Newtonsoft.Json;
using System.Linq;
using System.Web.Http;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class SeriesController : ApiController
    {
        SeriesDBContext series = new SeriesDBContext();

        // GET: api/series
        public IHttpActionResult Get()
        {
            return Json(series.Series
                    .Select(i => new { i.Series_ID, i.Series_Thumbnail, i.Series_Title, i.Series_Order })
                    .OrderBy(i => i.Series_Order));
        }

        // GET: api/series/{series_id}
        public IHttpActionResult GetSeries(int id)
        {
            Series selectedSeries = series.Series.Find(id);

            if (selectedSeries == null)
            {
                return NotFound();
            }

            AnimationDBContext animations = new AnimationDBContext();

            object response = new
            {
                selectedSeries.Series_ID,
                selectedSeries.Series_Title,
                selectedSeries.Series_Thumbnail,
                selectedSeries.Series_Description,
                animations = selectedSeries.Animation_Series.Select(i=> new {i.Anim_ID, i.Animation.Anim_Thumbnail, i.Animation.Anim_Title, i.AS_Order })
            };

            return Json(response);
        }
    }
}