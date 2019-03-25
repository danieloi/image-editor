/** @format */
/**
 * External dependencies
 */
import path from "path";
import urlLib from "url";
import { isUri } from "valid-url";

/**
 * Internal dependencies
 */
import resize from "../resize-image-url";
import { MimeTypes } from "./constants";

/**
 * Wrapper method for the HTML canvas toBlob() function. Polyfills if the
 * function does not exist
 *
 * @param {Object} canvas the canvas element
 * @param {Function} callback function to process the blob after it is extracted
 * @param {String} type image type to be extracted
 * @param {Number} quality extracted image quality
 */
export function canvasToBlob(canvas, callback, type, quality) {
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", {
      value: function(polyfillCallback, polyfillType, polyfillQuality) {
        const binStr = atob(
            this.toDataURL(polyfillType, polyfillQuality).split(",")[1]
          ),
          len = binStr.length,
          arr = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }

        polyfillCallback(
          new Blob([arr], {
            type: polyfillType || "image/png"
          })
        );
      }
    });
  }

  canvas.toBlob(callback, type, quality);
}

/**
 * Given a media object, returns a URL string to that media. Accepts
 * optional options to specify photon usage or a maximum image width.
 *
 * @param  {Object} media   Media object
 * @param  {Object} options Optional options, accepting a `photon` boolean,
 *                          `maxWidth` pixel value, `resize` string, or `size`.
 * @return {string}         URL to the media
 */
export function url(media, options) {
  if (!media) {
    return;
  }

  if (media.transient) {
    return media.URL;
  }

  // We've found that some media can be corrupt with an unusable URL.
  // Return early so attempts to parse the URL don't result in an error.
  if (!media.URL) {
    return;
  }

  options = options || {};

  //   if (options.photon) {
  //     if (options.maxWidth) {
  //       return photon(media.URL, { width: options.maxWidth });
  //     }
  //     if (options.resize) {
  //       return photon(media.URL, { resize: options.resize });
  //     }

  //     return photon(media.URL);
  //   }

  if (media.thumbnails && options.size in media.thumbnails) {
    return media.thumbnails[options.size];
  }

  if (options.maxWidth) {
    return resize(media.URL, {
      w: options.maxWidth
    });
  }

  if (options.resize) {
    return resize(media.URL, {
      resize: options.resize
    });
  }

  return media.URL;
}

/**
 * Given a media string, File, or object, returns the file extension.
 *
 * @example
 * getFileExtension( 'example.gif' );
 * getFileExtension( { URL: 'https://wordpress.com/example.gif' } );
 * getFileExtension( new window.File( [''], 'example.gif' ) );
 * // All examples return 'gif'
 *
 * @param  {(string|File|Object)} media Media object or string
 * @return {string}                     File extension
 */
export function getFileExtension(media) {
  let extension;

  if (!media) {
    return;
  }

  const isString = "string" === typeof media;
  const isFileObject = "File" in window && media instanceof window.File;

  if (isString) {
    let filePath;
    if (isUri(media)) {
      filePath = urlLib.parse(media).pathname;
    } else {
      filePath = media;
    }

    extension = path.extname(filePath).slice(1);
  } else if (isFileObject) {
    extension = path.extname(media.name).slice(1);
  } else if (media.extension) {
    extension = media.extension;
  } else {
    const pathname =
      urlLib.parse(media.URL || media.file || media.guid || "").pathname || "";
    extension = path.extname(pathname).slice(1);
  }

  return extension;
}

/**
 * Given a media string, File, or object, returns the MIME type if one can
 * be determined.
 *
 * @example
 * getMimeType( 'example.gif' );
 * getMimeType( { URL: 'https://wordpress.com/example.gif' } );
 * getMimeType( { mime_type: 'image/gif' } );
 * // All examples return 'image/gif'
 *
 * @param  {(string|File|Object)} media Media object or string
 * @return {string}                     Mime type of the media, if known
 */
export function getMimeType(media) {
  if (!media) {
    return;
  }

  if (media.mime_type) {
    return media.mime_type;
  } else if ("File" in window && media instanceof window.File) {
    return media.type;
  }

  let extension = getFileExtension(media);

  if (!extension) {
    return;
  }

  extension = extension.toLowerCase();
  if (MimeTypes.hasOwnProperty(extension)) {
    return MimeTypes[extension];
  }
}
