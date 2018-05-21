using ImageProcessor;
using ImageProcessor.Imaging.Formats;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using WooleyWorld_Website.Models;

namespace WooleyWorld_Website.Controllers.API
{
    public class ArtworksController : ApiController
    {
        private ArtworkDBContext artworks = new ArtworkDBContext();
        private TagDBContext tags = new TagDBContext();
        private string ThumbDirectory = HttpContext.Current.Server.MapPath("/") + "Content\\Artworks\\Thumbnails\\";
        private string ArtDirectory = HttpContext.Current.Server.MapPath("/") + "Content\\Artworks\\";

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
                string thumbnailPath = StoreThumbnail(artInput.Art_Image, thumbnailName);
                string imageName = artInput.Art_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-");
                string imagePath = StoreArtwork(artInput.Art_Image, imageName);

                StoreThumbnail(artInput.Art_Image, thumbnailName);
                StoreArtwork(artInput.Art_Image, imageName);

                artworkToChange.Art_Thumbnail = Path.GetFileName(thumbnailPath);
                artworkToChange.Art_Image = Path.GetFileName(imagePath);
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
            string thumbnailPath = StoreThumbnail(artInput.Art_Image, thumbnailName);
            string imageName = artInput.Art_Title + " - " + DateTime.Now.ToShortDateString().Replace("/", "-");
            string imagePath = StoreArtwork(artInput.Art_Image, imageName);

            newArtwork.Art_Title = artInput.Art_Title;
            newArtwork.Art_Description = artInput.Art_Description;
            newArtwork.Art_Type = artInput.Art_Type;
            newArtwork.Art_Date = DateTime.Now;
            newArtwork.Art_Thumbnail = Path.GetFileName(thumbnailPath);
            newArtwork.Art_Image = Path.GetFileName(imagePath);

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
            artworks.Artwork.Remove(artwork);
            artworks.SaveChanges();
            CleanUpTags();

            return Ok();
        }

        private string StoreThumbnail(string image, string imageName)
        {
            return StoreImage(image, imageName, true);
        }

        private string StoreArtwork(string image, string imageName)
        {
            return StoreImage(image, imageName, false);
        }

        private string StoreImage(string image, string imageName, bool isThumbnail)
        {
            string[] imageProperties = image.Split(',');
            string imageMimeType = Regex.Match(imageProperties[0], "(?<=:)(.*)(?=;)").Value;
            string imageString = imageProperties[1];
            string storagePath;
            byte[] decodedImage = Convert.FromBase64String(imageString);

            ISupportedImageFormat imageFormat;

            //adds file extension and sets the image format
            if (imageMimeType.Contains("png"))
            {
                imageName += ".png";
                imageFormat = new PngFormat();
            }
            else if (imageMimeType.Contains("gif"))
            {
                if (isThumbnail)
                {
                    imageName += ".png";
                    imageFormat = new PngFormat();
                }
                else
                {
                    imageName += ".gif";
                    imageFormat = new GifFormat();
                }
            }
            else
            {
                imageName += ".jpg";
                imageFormat = new JpegFormat();
            }

            using (MemoryStream imageStream = new MemoryStream(decodedImage))
            {
                using (ImageFactory imageFactory = new ImageFactory())
                {
                    imageFactory.Load(decodedImage);

                    //thumbnails go into their own directory
                    if (isThumbnail)
                    {
                        storagePath = ThumbDirectory + imageName;

                        //scaled down if dimensions are too large
                        using (Bitmap bitImage = new Bitmap((Bitmap)Image.FromStream(imageStream)))
                        {
                            if (bitImage.Height > 300)
                            {
                                int newHeight = 300;
                                double scaleRatio = newHeight / bitImage.Height;
                                int newWidth = (int)Math.Round(bitImage.Width * scaleRatio);

                                imageFactory.Resize(new Size(newWidth, newHeight));
                            }
                        }
                    }
                    else
                    {
                        storagePath = ArtDirectory + imageName;
                    }

                    imageFactory.Format(imageFormat)
                        .Quality(100)
                        .Save(storagePath);
                }
            }

            return storagePath;
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