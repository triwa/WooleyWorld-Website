using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Collections.Generic;

namespace WooleyWorld_Website.Models
{
    [Table("Series")]
    public class Series
    {
        [Key]
        public int Series_ID { get; set; }
        public string Series_Title { get; set; }
        public string Series_Thumbnail { get; set; }
        public string Series_Description { get; set; }
        public int Series_Order { get; set; }
        public virtual ICollection<Animation_Series> Animation_Series { get; set; }
    }

    public class SeriesDBContext : DbContext
    {
        public SeriesDBContext() : base("name = WooleyWorldDB")
        {

        }
        public DbSet<Series> Series { get; set; }
    }
}