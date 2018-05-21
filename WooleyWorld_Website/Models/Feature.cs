using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace WooleyWorld_Website.Models
{
    //Feature is a subtype of Animation
    [Table("Feature")]
    public class Feature : Animation
    {
        public int Feature_Order { get; set; }
    }

    public class FeatureDBContext : DbContext
    {
        public FeatureDBContext() : base("name = WooleyWorldDB")
        {
        }
        public DbSet<Feature> Feature { get; set; }
        public DbSet<Animation> Animation { get; set; }
    }
}