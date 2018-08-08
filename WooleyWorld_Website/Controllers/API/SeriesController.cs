using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class SeriesController : ApiController
    {
        SeriesDBContext series = new SeriesDBContext();
        private readonly string ThumbDirectory = HttpContext.Current.Server.MapPath("/") + "Content\\Series\\Thumbnails\\";

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
                selectedSeries.Series_Order,
                animations = selectedSeries.Animation_Series.Select(i => new { i.Anim_ID, i.Animation.Anim_Thumbnail, i.Animation.Anim_Title, i.AS_Order })
                    .OrderBy(i => i.AS_Order)
            };

            return Json(response);
        }

        //PUT: api/series
        [Authorize]
        //this is just for updating the orders of current series
        public IHttpActionResult PutSeriesOrder([FromBody]SeriesOrderRequest[] seriesInputArray)
        {
            foreach (SeriesOrderRequest item in seriesInputArray)
            {
                series.Series.Find(item.Series_ID).Series_Order = item.Series_Order;
            }

            series.SaveChanges();
            return Ok();
        }

        //PUT: api/series/{series_id}
        [Authorize]
        public IHttpActionResult PutSeries(int id, [FromBody]Series seriesRequest)
        {
            Series seriesToChange = series.Series.Find(id);
            seriesToChange.Series_Title = seriesRequest.Series_Title;
            seriesToChange.Series_Description = seriesRequest.Series_Description;
            
            //remove current thumbnail and store new one
            if (seriesRequest.Series_Thumbnail != "")
            {
                File.Delete(ThumbDirectory + seriesToChange.Series_Thumbnail);
                string thumbnailName = seriesRequest.Series_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-") + ".jpg";
                ImageUtil.StoreImage(seriesRequest.Series_Thumbnail, thumbnailName, ThumbDirectory);
                seriesToChange.Series_Thumbnail = thumbnailName;
            }

            //update what animations are in the series
            seriesToChange.Animation_Series.Clear();
            foreach (Animation_Series animSeries in seriesRequest.Animation_Series)
            {   
                seriesToChange.Animation_Series.Add(animSeries);
            }

            series.SaveChanges();
            return Ok();
        }

        //POST: api/series
        [Authorize]
        public IHttpActionResult PostSeries([FromBody]Series seriesRequest)
        {
            Series seriesToAdd = new Series();
            seriesToAdd.Series_Title = seriesRequest.Series_Title;
            seriesToAdd.Series_Description = seriesRequest.Series_Description;
            seriesToAdd.Animation_Series = new List<Animation_Series>();

            string thumbnailName = seriesRequest.Series_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-") + ".jpg";
            ImageUtil.StoreImage(seriesRequest.Series_Thumbnail, thumbnailName, ThumbDirectory);
            seriesToAdd.Series_Thumbnail = thumbnailName;

            foreach (Animation_Series animSeries in seriesRequest.Animation_Series)
            {
                Animation_Series animation_Series = new Animation_Series()
                {
                    Anim_ID = animSeries.Anim_ID,
                    AS_Order = animSeries.AS_Order,
                    Series_ID = seriesToAdd.Series_ID
                };
                
                seriesToAdd.Animation_Series.Add(animation_Series);
            }

            series.Series.Add(seriesToAdd);
            series.SaveChanges();
            return Ok();
        }

        //DELETE: api/series/{series_id}
        [Authorize]
        public IHttpActionResult DeleteSeries(int id)
        {
            series.Series.Remove(series.Series.Find(id));
            series.SaveChanges();
            return Ok();
        }

        public class SeriesOrderRequest
        {
            public int Series_ID { get; set; }
            public int Series_Order { get; set; }
        }
    }
}