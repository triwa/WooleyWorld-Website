using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace WooleyWorld_Website.Models
{
    //Feature is a subtype of Animation
    [Table("Feature")]
    public class Feature
    {
        [Key]
        [ForeignKey("Animation")]
        public int Anim_ID { get; set; }
        public int Feature_Order { get; set; }

        public virtual Animation Animation { get; set; }
    }

    public class FeatureDBContext : DbContext
    {
        public FeatureDBContext() : base("name = WooleyWorldDB")
        {
        }
        public DbSet<Feature> Feature { get; set; }
    }
}