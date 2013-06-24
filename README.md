#Video Wrapper

A wrapper for Vimeo's [Froogaloop](https://developer.vimeo.com/player/js-api) API and [MediaElement JS](http://mediaelementjs.com/) that provides a consistent (although minimal) API across both.

##Dependencies

- [jQuery](http://jquery.com/)
- [Froogaloop](https://github.com/vimeo/player-api/tree/master/javascript)
- [MediaElement.js](https://github.com/johndyer/mediaelement)

##Usage

VideoWrapper should be passed a video-less container element, it will then embed video as necessary/configured.

The container for your video has configuration information associated with it using data- attributes:

- data-type:		( 'vimeo' / 'raw', required) Is it a vimeo URL, to be embedded, or a direct link to a video file.
- data-url:			( url, required ) the URL for the video file, or Vimeo's page URL
- data-autoloop:	( true/false, optional ) should the video loop?
- data-autoplay:	( true/false, optional ) should the video play automatically?
- data-automute:	( true/false, optional ) should the video be muted by default?
- data-loader:		( true/false, optional ) should a loader be shown? You can pass a loadStart and a loadEnd event in the initialisation to control this. (This was very use-case specific)

You might have an image for a poster frame and a play button in there, to display until the video's loaded.

For example, for a vimeo video:

```
<div class="video" data-type="vimeo" data-url="https://vimeo.com/62330115" data-autoplay="true">
	<img class="poster" src="path/to/the/image.jpg">		
	<a href="https://vimeo.com/62330115">Play</a>
</div>
```

Then in the JavaScript, call:

```
var v = new VideoWrapper( $('.video') );
```