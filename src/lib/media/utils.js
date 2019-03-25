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

  if (options.photon) {
    if (options.maxWidth) {
      return photon(media.URL, { width: options.maxWidth });
    }
    if (options.resize) {
      return photon(media.URL, { resize: options.resize });
    }

    return photon(media.URL);
  }

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
