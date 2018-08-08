using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace WooleyWorld_Website.Controllers.API
{
    public class ImageUtil
    {
        public static void StoreImage(string thumbnail, string thumbnailName, string thumbDirectory)
        {
            string imageString = thumbnail.Split(',')[1];
            string thumbnailStoragePath = thumbDirectory + thumbnailName;

            var decodedThumbnail = Convert.FromBase64String(imageString);
            MemoryStream streamBitmap = new MemoryStream(decodedThumbnail);
            Bitmap bitImage = new Bitmap((Bitmap)Image.FromStream(streamBitmap));

            Encoder encoder = Encoder.Quality;
            EncoderParameters parameters = new EncoderParameters(1);
            EncoderParameter encoderParameter = new EncoderParameter(encoder, 100L);
            parameters.Param[0] = encoderParameter;

            bitImage.Save(thumbnailStoragePath,
               ImageCodecInfo.GetImageEncoders().Where(i => i.MimeType == "image/jpeg").First(),
               parameters);
        }
    }
}