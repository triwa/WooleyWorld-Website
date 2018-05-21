using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace WooleyWorld_Website.Models
{
    //Animation_Series is an associative entity for animation and series 
    [Table("Animation_Series")]
    public class Animation_Series
    {
        [Key, Column(Order = 1)]
        [ForeignKey("Series")]
        public int Series_ID { get; set; }
        [Key, Column(Order = 2)]
        [ForeignKey("Animation")]
        public int Anim_ID { get; set; }
        public int AS_Order { get; set; }

        public virtual Series Series { get; set; }
        public virtual Animation Animation { get; set; }
    }
}