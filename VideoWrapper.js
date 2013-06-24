(function( $, $f ){
	
	var VID_COUNT = 0; //track how many videos we have - allow us to assign a unigue id.

	var VideoWrapper = function( ele, options ){
		var that = this;

		this.$ele = $( ele );
		this.$img = $( 'img', that.$ele );
		this.$button = $('.button', this.$ele );

		this.type = this.$ele.data( 'type' );
		this.url = this.$ele.data( 'url' );
		this.autoloop = !!this.$ele.data( 'autoloop' );
		this.autoplay = !!this.$ele.data( 'autoplay' );
		this.automute = !!this.$ele.data( 'mute' );
		this.loader = !!this.$ele.data( 'loader' );
		this.isPlaying = false;
		this.isEnded = false;
		this.isLoadCalled = false;

		var v = document.createElement('video');
		if(v.canPlayType && v.canPlayType('video/mp4').replace(/no/, '')) {
			this.canPlayMP4 = true;
		}

		this.id = VID_COUNT;

		this.loadStart = options.loadStart;
		this.loadEnd = options.loadEnd;

		if( this.autoplay && this.loader ){
			this.$button.addClass('loader');
			this.loadStart( this.$button, 20 );
		}

		this.getSize( function( w, h ){
			that.w = w;
			that.h = h;
			that.$ele.width( w );
			that.$ele.height( h );
			that.pickFunction( function(){
				that.initRaw();
			}, function(){
				that.initVimeo();
			});
			that.initUI();
		});

		VID_COUNT++;

	};

	VideoWrapper.prototype = {
		pickFunction: function( rawFn, vimFn ){
			switch( this.type ){
				case 'raw':
					rawFn();
				break;
				case 'vimeo':
					vimFn();
				break;
			}
		},
		getSize: function( callback ){
			var that = this;
			this.$img.imagesLoaded( function(){
				var w = that.$img.width();
				var h = that.$img.height();
				if( typeof callback === 'function' ){
					callback( w, h );
				}
			});
		},
		initUI: function(){
			var that = this;
			this.$button.click( function( e ){
				e.preventDefault();
				e.stopPropagation();
				that.toggle();
				that.updateUI();
			});
		},
		updateUI: function(){
			if( this.isPlaying ){
				this.$img.fadeOut( 500 );
				this.$button.addClass('hidden');
				this.$button.removeClass('paused');
				this.$ele.addClass( 'playing' ).removeClass( 'paused' );
				if( this.loader ){
					this.loadEnd( this.$ele );
				}
			} else {
				this.$img.fadeIn( 500 );
				this.$button.removeClass('hidden');
				this.$button.addClass('paused');
				this.$ele.removeClass( 'playing' ).addClass( 'paused' );
			}
			if( this.isEnded ){
				this.$img.fadeIn( 500 );
				this.$ele.addClass( 'ended' );
				this.$button.addClass('ended');
				if( this.loader ){
					this.$button.removeClass('loader');
					this.loadEnd( this.$ele );
				}
			} else {
				this.$ele.removeClass( 'ended' );
				this.$button.removeClass('ended');
			}
		},
		initRaw: function(){
			var that = this;
			this.$videoElement = $( '<video src="' + this.url + '" width="' + this.w + '" height="' + this.h + '"></video>' );
			this.$ele.prepend( this.$videoElement );
			new MediaElement(
				this.$videoElement[ 0 ],
				{
					enablePluginDebug: false,
					success: function( media ){
						that.player = media;
						that.$player = $(that.player);
						media.addEventListener( 'play', function(){
							that.isPlaying = true;
							that.isEnded = false;
							that.updateUI();
						});
						that.$player.on( 'play', function(){
							that.isPlaying = true;
							that.isEnded = false;
							that.updateUI();
						});
						that.$player.on( 'ended', function(){
							that.isPlaying = false;
							that.isEnded = true;
							that.updateUI();
							if( that.autoloop ){
								that.play();
							}
						});
						that.$player.on( 'pause', function(){
							that.isPlaying = false;	
							that.updateUI();
						});
						if( that.autoplay ){
							that.play();
						} 
						setTimeout( function(){
							if( that.automute ){
								that.mute()
							}
						}, 10);
					},
					error: function( e ){
						console.log( 'Media Element error: ' );
						console.log( e );
					}
				}
			);
		},
		initVimeo: function(){
			var that = this;
			var id = 'videoplayer-' + that.id;
			var request = 'http://vimeo.com/api/oembed.json?url=' + encodeURIComponent( this.url );
				request +=  '&width=' + this.w;
				request += '&byline=false';
				request += '&title=false';
				request += '&portrait=false';
				request += '&color=false';
				if( that.autoplay ){
					request += '&autoplay=true';
				}
				if( that.autoloop ){
					request += '&loop=true';
				}
				request += ('&player_id=' + id );
				request += '&api=true';

				$.get( request, function( data ){
					that.$ele.prepend( data.html );
					var iframe = that.$ele.children( 'iframe' );
					iframe.attr('id', id);
					that.player = $f( iframe[0] );
					that.player.addEvent('ready', function(){
						that.isPlaying = true;
						that.isEnded = false;
						that.updateUI();
						if( that.automute ){
							that.mute()
						}
						that.player.addEvent('play', function(){
							that.isPlaying = true;
							that.isEnded = false;
							that.updateUI();
						});
						that.player.addEvent('pause', function(){
							that.isPlaying = false;	
							that.updateUI();
						});

						that.player.addEvent('finish', function(){
							that.isPlaying = false;
							that.isEnded = true;
							that.updateUI();
							if( that.autoloop ){
								that.play();
							}
						});
					});
				});
		},
		unMute: function(){
			var that = this;
			this.pickFunction( function(){
				that.player.setVolume( 1 );
			}, function(){
				that.player.api( 'setVolume', 1 );
			});
		},
		mute: function(){
			var that = this;
			this.pickFunction( function(){
				that.player.setVolume( 0 );
			}, function(){
				that.player.api( 'setVolume', 0 );
			});
		},
		play: function(){
			var that = this;
			this.pickFunction( function(){
				if( that.isEnded ){
					that.isEnded = false;
					that.seekTo( 0 );
					if( that.canPlayMP4 ){
						that.player.load();
					}
				}
				if( that.canPlayMP4 ){
					if( !that.isLoadCalled ){
						that.player.load();
						that.isLoadCalled = true;
					}
				}
				that.player.play();
			}, function(){
				if( that.isEnded ){
					that.isEnded = false;
					that.seekTo( 0 );
				}
				that.player.api('play');
			});
		},
		pause: function(){
			var that = this;
			this.pickFunction( function(){
				that.player.pause();
			}, function(){
				that.player.api('pause');
			});
		},
		toggle: function(){
			var that = this;
			if( that.isPlaying ){
				that.pause();
			} else {
				if( that.loader ){					
					that.loadStart( that.$ele );
				}
				that.play();
			}
		},
		seekTo: function( position ){
			var that = this;
			this.pickFunction( function(){
				that.player.setCurrentTime( position );
			}, function(){
				that.player.api( 'seekTo', position );
			});
		}
	};

	window.VideoWrapper = VideoWrapper;

})( jQuery, Froogaloop );