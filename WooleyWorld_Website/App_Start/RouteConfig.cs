using System.Web.Mvc;
using System.Web.Routing;

namespace WooleyWorld_Website
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "AboutUs",
                url: "AboutUs",
                defaults: new { controller = "AboutUs", action = "AboutUs" }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Home", id = UrlParameter.Optional }
            );
        }
    }
}