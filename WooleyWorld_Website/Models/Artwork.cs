using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Collections.Generic;

namespace WooleyWorld_Website.Models
{
    [Table("Artwork")]
    public class Artwork
    {
        [Key]
        public int Art_ID { get; set; }
        public string Art_Image { get; set; }
        public string Art_Title { get; set; }
        public DateTime Art_Date { get; set; }
        public string Art_Thumbnail { get; set; }
        public string Art_Description { get; set; }
        public string Art_Type { get; set; }
        public virtual ICollection<Artwork_Tag> Artwork_Tag { get; set; }

        public Artwork()
        {
            Artwork_Tag = new HashSet<Artwork_Tag>();
        }
    }

    public class ArtworkDBContext : DbContext
    {
        public ArtworkDBContext() : base("name = WooleyWorldDB")
        {

        }
        public DbSet<Artwork> Artwork { get; set; }
    }
}