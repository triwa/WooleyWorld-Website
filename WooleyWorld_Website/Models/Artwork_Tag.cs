using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace WooleyWorld_Website.Models
{
    [Table("Artwork_Tag")]
    public class Artwork_Tag
    {
        [Key, Column(Order = 1)]
        [ForeignKey("Artwork")]
        public int Art_ID { get; set; }
        [Key, Column(Order = 2)]
        [ForeignKey("Tag")]
        public int Tag_ID { get; set; }

        public virtual Artwork Artwork { get; set; }
        public virtual Tag Tag { get; set; }
    }
}