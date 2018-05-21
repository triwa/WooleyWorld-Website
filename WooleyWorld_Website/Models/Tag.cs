using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity;
using System.Collections.Generic;

namespace WooleyWorld_Website.Models
{
    [Table("Tag")]
    public class Tag
    {
        [Key]
        public int Tag_ID { get; set; }
        public string Tag_Title { get; set; }
        public virtual ICollection<Artwork_Tag> Artwork_Tag { get; set; }
    }

    public class TagDBContext : DbContext
    {
        public TagDBContext() : base("name = WooleyWorldDB")
        {

        }
        public DbSet<Tag> Tag { get; set; }
    }
}