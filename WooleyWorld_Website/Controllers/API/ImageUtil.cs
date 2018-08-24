using ImageProcessor;
using ImageProcessor.Imaging.Formats;
using System;
using System.Drawing;
using System.IO;
using System.Text.RegularExpressions;

namespace WooleyWorld_Website.Controllers.API
{
    public class ImageUtil
    {
        /// <summary>
        /// Stores the image as gif, png, or jpg. Thumbnails are max 600 x 600px.
        /// Returns file name with extension.
        /// </summary>
        public static string StoreThumbnail(string image, string imageName, string storageLocation)
        {
            return StoreImage(image, imageName, storageLocation, true);
        }

        /// <summary>
        /// Stores the image as gif, png, or jpg.
        /// Returns file name with extension.
        /// </summary>
        public static string StoreArtwork(string image, string imageName, string storageLocation)
        {
            return StoreImage(image, imageName, storageLocation, false);
        }

        private static string StoreImage(string image, string imageName, string storageLocation, bool isThumbnail)
        {
            string[] imageProperties = image.Split(',');
            string imageMimeType = Regex.Match(imageProperties[0], "(?<=:)(.*)(?=;)").Value;
            string imageString = imageProperties[1];
            string storagePath;
            byte[] decodedImage = Convert.FromBase64String(imageString);
            int maxThumbHeight = 300;
            int maxThumbWidth = 300;

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

            //saves the image
            using (MemoryStream imageStream = new MemoryStream(decodedImage))
            {
                using (ImageFactory imageFactory = new ImageFactory())
                {
                    imageFactory.Load(decodedImage);

                    //thumbnails need to be scaled down
                    if (isThumbnail)
                    {
                        storagePath = storageLocation + imageName;

                        using (Bitmap bitImage = new Bitmap((Bitmap)Image.FromStream(imageStream)))
                        {
                            if (bitImage.Height > maxThumbHeight)
                            {
                                int newHeight = maxThumbHeight;
                                double scaleRatio = newHeight / bitImage.Height;
                                int newWidth = (int)Math.Round(bitImage.Width * scaleRatio);

                                imageFactory.Resize(new Size(newWidth, newHeight));
                            }
                            else if (bitImage.Width > maxThumbWidth)
                            {
                                int newWidth = maxThumbWidth;
                                double scaleRatio = newWidth / bitImage.Width;
                                int newHeight = (int)Math.Round(bitImage.Height * scaleRatio);

                                imageFactory.Resize(new Size(newWidth, newHeight));
                            }
                        }
                    }
                    else
                    {
                        storagePath = storageLocation + imageName;
                    }

                    imageFactory.Format(imageFormat)
                        .Quality(100)
                        .Save(storagePath);
                }
            }
            return imageName;
        }
    }
}