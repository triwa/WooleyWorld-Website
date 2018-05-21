using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace WooleyWorld_Website.Models
{
    [Table("Administrator")]
    public class Administrator
    {
        [Key]
        public string Admin_Username { get; set; }
        public string Admin_Password { get; set; }
        public string Admin_Salt { get; set; }
    }

    public class AdministratorDBContext : DbContext
    {
        public AdministratorDBContext() : base("name = WooleyWorldDB")
        {

        }
        public DbSet<Administrator> Administrator { get; set; }
    }
}