using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class ArtworksController : ApiController
    {
        private ArtworkDBContext artworks = new ArtworkDBContext();
        private TagDBContext tags = new TagDBContext();
        private readonly string ThumbDirectory = HttpContext.Current.Server.MapPath("/") + "Content\\Artworks\\Thumbnails\\";
        private readonly string ArtDirectory = HttpContext.Current.Server.MapPath("/") + "Content\\Artworks\\";

        // GET: api/Artworks
        public IHttpActionResult GetArtwork()
        {
            var response = artworks.Artwork.Select(i => new
            {
                i.Art_ID,
                i.Art_Image,
                i.Art_Date,
                i.Art_Description,
                i.Art_Thumbnail,
                i.Art_Title,
                i.Art_Type
            });

            return Json(response);
        }

        // GET: api/Artworks/{art_id}
        public IHttpActionResult GetArtwork(int id)
        {
            Artwork selectedArtwork = artworks.Artwork.Find(id);

            if (selectedArtwork == null)
            {
                return NotFound();
            }

            object response = new
            {
                selectedArtwork.Art_ID,
                selectedArtwork.Art_Image,
                selectedArtwork.Art_Date,
                selectedArtwork.Art_Description,
                selectedArtwork.Art_Thumbnail,
                selectedArtwork.Art_Title,
                selectedArtwork.Art_Type,
                tags = selectedArtwork.Artwork_Tag.Select(i => new { i.Tag_ID, i.Tag.Tag_Title })
            };

            return Json(response);
        }

        // PUT: api/Artworks/{art_id}
        [Authorize]
        public IHttpActionResult PutArtwork(int id, [FromBody]ArtworkRequest artInput)
        {
            Artwork artworkToChange = artworks.Artwork.Where(i => i.Art_ID == id).First();

            artworkToChange.Art_Title = artInput.Art_Title;
            artworkToChange.Art_Description = artInput.Art_Description;

            //replace image and thumbnail if changed
            if (artInput.Art_Image != null)
            {
                File.Delete(ThumbDirectory + artworkToChange.Art_Thumbnail);
                File.Delete(ArtDirectory + artworkToChange.Art_Image);

                string thumbnailName = artInput.Art_Title + "_thumb - " + DateTime.Now.ToShortDateString().Replace("/", "-");
                string imageName = artInput.Art_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-");

                artworkToChange.Art_Thumbnail = ImageUtil.StoreThumbnail(artInput.Art_Image, thumbnailName, ThumbDirectory);
                artworkToChange.Art_Image = ImageUtil.StoreArtwork(artInput.Art_Image, imageName, ArtDirectory);
            }

            //delete tags if needed
            List<Artwork_Tag> tagsToRemove = new List<Artwork_Tag>();
            foreach (Artwork_Tag item in artworkToChange.Artwork_Tag)
            {
                if (!artInput.Art_Tags.Any(i=>i.Equals(item.Tag.Tag_Title)))
                {
                    tagsToRemove.Add(item);
                }
            }
            foreach (Artwork_Tag item in tagsToRemove)
            {
                artworkToChange.Artwork_Tag.Remove(item);
            }

            //add or set tag if needed
            var currentTags = artworkToChange.Artwork_Tag.ToList();
            foreach (string item in artInput.Art_Tags)
            {
                if (currentTags.Any(i => i.Tag.Tag_Title.Equals(item)))
                {
                    continue;
                }
                
                //if tag doesn't exist
                if (!tags.Tag.Any(i => i.Tag_Title.Equals(item)))
                {
                    Tag newTag = new Tag() { Tag_Title = item };
                    tags.Tag.Add(newTag);
                    tags.SaveChanges();
                }

                Tag tagToAdd = tags.Tag.First(i => i.Tag_Title.Equals(item));
                artworkToChange.Artwork_Tag.Add(new Artwork_Tag { Art_ID = artworkToChange.Art_ID, Tag_ID = tagToAdd.Tag_ID });
            }

            artworks.SaveChanges();
            CleanUpTags();

            return Ok();
        }

        // POST: api/Artworks
        [Authorize]
        public IHttpActionResult PostArtwork([FromBody]ArtworkRequest artInput)
        {
            Artwork newArtwork = new Artwork();

            string thumbnailName = artInput.Art_Title + "_thumb - " + DateTime.Now.ToShortDateString().Replace("/", "-");
            string imageName = artInput.Art_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-");

            newArtwork.Art_Title = artInput.Art_Title;
            newArtwork.Art_Description = artInput.Art_Description;
            newArtwork.Art_Type = artInput.Art_Type;
            newArtwork.Art_Date = DateTime.Now;
            newArtwork.Art_Thumbnail = ImageUtil.StoreThumbnail(artInput.Art_Image, thumbnailName, ThumbDirectory);
            newArtwork.Art_Image = ImageUtil.StoreArtwork(artInput.Art_Image, imageName, ArtDirectory);

            //create tag entities and link to artwork
            foreach (string item in artInput.Art_Tags)
            {
                //create tag if it doesn't exist
                if (!tags.Tag.Any(i => i.Tag_Title.Equals(item)))
                {
                    Tag newTag = new Tag() { Tag_Title = item };
                    tags.Tag.Add(newTag);
                    tags.SaveChanges();
                }

                Tag tagToAdd = tags.Tag.First(i => i.Tag_Title.Equals(item));
                newArtwork.Artwork_Tag.Add(new Artwork_Tag { Art_ID = newArtwork.Art_ID, Tag_ID = tagToAdd.Tag_ID });
            }

            artworks.Artwork.Add(newArtwork);
            artworks.SaveChanges();

            return Ok(artInput);
        }

        // DELETE: api/Artworks/{art_id}
        [Authorize]
        public IHttpActionResult DeleteArtwork(int id)
        {
            Artwork artwork = artworks.Artwork.Find(id);
            File.Delete(ThumbDirectory + artwork.Art_Thumbnail);
            File.Delete(ArtDirectory + artwork.Art_Image);
            artworks.Artwork.Remove(artwork);
            artworks.SaveChanges();
            CleanUpTags();

            return Ok();
        }

        //remove unused tags from the database
        private void CleanUpTags()
        {
            foreach (Tag item in tags.Tag.ToList())
            {
                //new tags will throw the exception for some reason
                try
                {
                    if (item.Artwork_Tag.Count == 0)
                    {
                        tags.Tag.Remove(item);
                    }
                }
                catch (NullReferenceException)
                { }
            }

            tags.SaveChanges();
        }

        public class ArtworkRequest
        {
            public string Art_Image { get; set; }
            public string Art_Title { get; set; }
            public string Art_Description { get; set; }
            public string Art_Type { get; set; }
            public string[] Art_Tags { get; set; }
        }
    }
}