/**
 * Wrapper method for the HTML canvas toBlob() function. Polyfills if the
 * function does not exist
 *
 * @param {Object} canvas the canvas element
 * @param {Function} callback function to process the blob after it is extracted
 * @param {String} type image type to be extracted
 * @param {Number} quality extracted image quality
 */
export function canvasToBlob( canvas, callback, type, quality ) {
	if ( ! HTMLCanvasElement.prototype.toBlob ) {
		Object.defineProperty( HTMLCanvasElement.prototype, 'toBlob', {
			value: function( polyfillCallback, polyfillType, polyfillQuality ) {
				const binStr = atob( this.toDataURL( polyfillType, polyfillQuality ).split( ',' )[ 1 ] ),
					len = binStr.length,
					arr = new Uint8Array( len );

				for ( let i = 0; i < len; i++ ) {
					arr[ i ] = binStr.charCodeAt( i );
				}

				polyfillCallback(
					new Blob( [ arr ], {
						type: polyfillType || 'image/png',
					} )
				);
			},
		} );
	}

	canvas.toBlob( callback, type, quality );
}
