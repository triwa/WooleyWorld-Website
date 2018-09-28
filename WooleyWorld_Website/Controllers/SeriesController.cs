using System.Web.Mvc;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers
{
    public class SeriesController : Controller
    {
        // GET: Series
        public ActionResult Series(int id = -1)
        {
            SeriesDBContext series = new SeriesDBContext();
            Series selectedSeries = series.Series.Find(id);

            if (selectedSeries == null)
            {
                return Redirect("/Animations");
            }

            ViewBag.Series_Title = selectedSeries.Series_Title;

            return View();
        }
    }
}