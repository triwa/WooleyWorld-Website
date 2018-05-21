using System;
using System.Linq;
using System.Web.Mvc;
using WooleyWorld_Website.Models;
using System.Security.Cryptography;
using System.Web.Security;

namespace WooleyWorld_Website.Controllers
{
    public class AdminController : Controller
    {
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Login Actions
        //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        public ActionResult Login()
        {
            return View();
        }

        //checks against the database for admin credentials.
        //If credentials are verified, give authentication.
        [HttpPost, ValidateAntiForgeryToken]
        public ActionResult Authenticate(string usernameInput, string passwordInput, string destination)
        {
            if (!ModelState.IsValid)
            {
                return View("Login");
            }

            AdministratorDBContext AdminContext = new AdministratorDBContext();

            //selects admin with matching username
            var selectedAdmin = AdminContext.Administrator.Where(admin => admin.Admin_Username == usernameInput);
            //if no username match, go back to login
            if (selectedAdmin.Count() == 0)
            {
                return RedirectToAction("Login/0");
            }

            //get salt and password from the database for comparison
            byte[] dbSalt = Convert.FromBase64String(selectedAdmin.First().Admin_Salt);
            byte[] dbPassword = Convert.FromBase64String(selectedAdmin.First().Admin_Password);

            Rfc2898DeriveBytes passwordInputHasher = new Rfc2898DeriveBytes(passwordInput, dbSalt);
            byte[] hashedInputPassword = passwordInputHasher.GetBytes(190);

            //if passwords match, authenticate and bring to destination
            if (hashedInputPassword.SequenceEqual(dbPassword))
            {
                FormsAuthentication.RedirectFromLoginPage(usernameInput, false);

                if (destination == "CMS")
                {
                    return RedirectToAction("CMS");
                }
                else
                {
                    return RedirectToAction("AdminPanel");
                }

            }

            //if passwords don't match, return to login view
            return RedirectToAction("Login/0");
        }

        [Authorize]
        public ActionResult AdminPanel()
        {
            return View();
        }

        [Authorize]
        public ActionResult CMS()
        {
            return View();
        }
    }
}