using System;
using System.Linq;
using WooleyWorld_Website.Models;
using System.Web.Http;
using System.Security.Cryptography;
using System.Data.Entity;

namespace WooleyWorld_Website.Controllers.API
{
    [Authorize]
    public class AdministratorsController : ApiController
    {
        AdministratorDBContext administrators = new AdministratorDBContext();

        // GET api/administrators
        //returns admin usernames
        public IHttpActionResult Get()
        {
            return Json(administrators.Administrator.Select(i=>i.Admin_Username));
        }

        // POST api/administrators
        // encrypts the sent password and creates a new administrator
        public void Post([FromBody]Administrator value)
        {
            Administrator newAdmin;
            string hashedPassword,
                   salt;

            Rfc2898DeriveBytes hasher = new Rfc2898DeriveBytes(value.Admin_Password, 190);
            byte[] saltBytes = hasher.Salt;
            byte[] hashedPasswordBytes = hasher.GetBytes(190);

            salt = Convert.ToBase64String(saltBytes);
            hashedPassword = Convert.ToBase64String(hashedPasswordBytes);

            newAdmin = new Administrator()
            {
                Admin_Username = value.Admin_Username,
                Admin_Password = hashedPassword,
                Admin_Salt = salt
            };

            administrators.Administrator.Add(newAdmin);
            administrators.SaveChanges();
        }

        // DELETE api/administrators/<Admin_Username>
        public void Delete(string id)
        {
            Administrator adminToRemove = new Administrator { Admin_Username = id };
            administrators.Entry(adminToRemove).State = EntityState.Deleted;
            administrators.SaveChanges();
        }
    }
}