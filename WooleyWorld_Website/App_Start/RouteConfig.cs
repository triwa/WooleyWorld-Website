﻿using System.Web.Mvc;
using System.Web.Routing;

namespace WooleyWorld_Website
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.MapMvcAttributeRoutes();

            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "AboutUs",
                url: "AboutUs",
                defaults: new { controller = "AboutUs", action = "AboutUs"}
            );

            routes.MapRoute(
                 name: "Gallery",
                 url: "Gallery/{action}/{id}",
                 defaults: new { controller = "Gallery", action = "Gallery", id = UrlParameter.Optional }
             );

            routes.MapRoute(
                 name: "Animations",
                 url: "Animations/{action}/{id}",
                 defaults: new { controller = "Animations", action = "Animations", id = UrlParameter.Optional }
             );

            routes.MapRoute(
                 name: "Series",
                 url: "Series/{id}",
                 defaults: new { controller = "Series", action = "Series", id = UrlParameter.Optional }
             );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Home", id = UrlParameter.Optional }
            );
        }
    }
}