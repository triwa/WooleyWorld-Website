using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace WooleyWorld_Website.Models
{
    [Table("Animation")]
    public class Animation
    {
        [Key]
        public int Anim_ID { get; set; }
        public string Anim_Video { get; set; }
        public string Anim_Title { get; set; }
        public string Anim_Thumbnail { get; set; }
        public DateTime Anim_Date { get; set; }
        public string Anim_Description { get; set; }
        public virtual ICollection<Animation_Series> Animation_Series { get; set; }
    }

    public class AnimationDBContext : DbContext
    {
        public AnimationDBContext() : base("name = WooleyWorldDB")
        {

        }
        public DbSet<Animation> Animation { get; set; }
    }
}