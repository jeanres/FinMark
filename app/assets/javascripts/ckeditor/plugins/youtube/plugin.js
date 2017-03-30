/*
* Youtube Embed Plugin
*
* @author Jonnas Fonini <jonnasfonini@gmail.com>
* @version 2.1.4
*/
(function () {
	CKEDITOR.plugins.add('youtube', {
		lang: [ 'en', 'pt', 'pt-br', 'ja', 'hu', 'it', 'fr', 'tr', 'ru', 'de', 'ar', 'nl', 'pl', 'vi', 'zh', 'el', 'he', 'es', 'nb', 'nn', 'fi', 'et', 'sk', 'cs', 'ko'],
		init: function (editor) {
			editor.addCommand('youtube', new CKEDITOR.dialogCommand('youtube', {
				allowedContent: 'div{*}(*); iframe{*}[!width,!height,!src,!frameborder,!allowfullscreen]; object param[*]; a[*]; img[*]'
			}));

			editor.ui.addButton('Youtube', {
				label : editor.lang.youtube.button,
				toolbar : 'insert',
				command : 'youtube',
				icon : this.path + 'images/icon.png'
			});

			CKEDITOR.dialog.add('youtube', function (instance) {
				var video;

				return {
					title : editor.lang.youtube.title,
					minWidth : 510,
					minHeight : 200,
					contents :
						[{
							id : 'youtubePlugin',
							expand : true,
							elements :
								[{
									id : 'txtEmbed',
									type : 'textarea',
									label : editor.lang.youtube.txtEmbed,
									autofocus : 'autofocus',
									onChange : function (api) {
										handleEmbedChange(this, api);
									},
									onKeyUp : function (api) {
										handleEmbedChange(this, api);
									},
									validate : function () {
										if (this.isEnabled()) {
											if (!this.getValue()) {
												alert(editor.lang.youtube.noCode);
												return false;
											}
											else
											if (this.getValue().length === 0 || this.getValue().indexOf('//') === -1) {
												alert(editor.lang.youtube.invalidEmbed);
												return false;
											}
										}
									}
								},
								{
									type : 'html',
									html : editor.lang.youtube.or + '<hr>'
								},
								{
									type : 'hbox',
									widths : [ '70%', '15%', '15%' ],
									children :
									[
										{
											id : 'txtUrl',
											type : 'text',
											label : editor.lang.youtube.txtUrl,
											onChange : function (api) {
												handleLinkChange(this, api);
											},
											onKeyUp : function (api) {
												handleLinkChange(this, api);
											},
											validate : function () {
												if (this.isEnabled()) {
													if (!this.getValue()) {
														alert(editor.lang.youtube.noCode);
														return false;
													}
													else{
														video = ytVidId(this.getValue());

														if (this.getValue().length === 0 ||  video === false)
														{
															alert(editor.lang.youtube.invalidUrl);
															return false;
														}
													}
												}
											}
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%' ],
									children :
										[
											{
												id : 'chkNoEmbed',
												type : 'checkbox',
												label : editor.lang.youtube.txtNoEmbed,
												'default' : editor.config.youtube_noembed != null ? editor.config.youtube_noembed : false
											}
										]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%' ],
									children :
									[
										{
											id : 'chkRelated',
											type : 'checkbox',
											'default' : editor.config.youtube_related != null ? editor.config.youtube_related : true,
											label : editor.lang.youtube.chkRelated
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%' ],
									children :
									[
										{
											id : 'chkPrivacy',
											type : 'checkbox',
											label : editor.lang.youtube.chkPrivacy,
											'default' : editor.config.youtube_privacy != null ? editor.config.youtube_privacy : false
										},
										{
											id : 'chkAutoplay',
											type : 'checkbox',
											'default' : editor.config.youtube_autoplay != null ? editor.config.youtube_autoplay : false,
											label : editor.lang.youtube.chkAutoplay
										}
									]
								},
								{
									type : 'hbox',
									widths : [ '55%', '45%'],
									children :
									[
										{
											id : 'txtStartAt',
											type : 'text',
											label : editor.lang.youtube.txtStartAt,
											validate : function () {
												if (this.getValue()) {
													var str = this.getValue();

													if (!/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/i.test(str)) {
														alert(editor.lang.youtube.invalidTime);
														return false;
													}
												}
											}
										},
										{
											id : 'chkControls',
											type : 'checkbox',
											'default' : editor.config.youtube_controls != null ? editor.config.youtube_controls : true,
											label : editor.lang.youtube.chkControls
										}
									]
								}
							]
						}
					],
					onOk: function()
					{
						var content = '';
						var responsiveStyle = '';

						if (this.getContentElement('youtubePlugin', 'txtEmbed').isEnabled()) {
							content = this.getValueOf('youtubePlugin', 'txtEmbed');
						}
						else {
							var url = 'https://', params = [], startSecs;
              var width = 640; // Hardcoded value
              var height = 360; // Hardcoded value

							if (this.getContentElement('youtubePlugin', 'chkPrivacy').getValue() === true) {
								url += 'www.youtube-nocookie.com/';
							}
							else {
								url += 'www.youtube.com/';
							}

							url += 'embed/' + video;

							if (this.getContentElement('youtubePlugin', 'chkRelated').getValue() === false) {
								params.push('rel=0');
							}

							if (this.getContentElement('youtubePlugin', 'chkAutoplay').getValue() === true) {
								params.push('autoplay=1');
							}

							if (this.getContentElement('youtubePlugin', 'chkControls').getValue() === false) {
								params.push('controls=0');
							}

							startSecs = this.getValueOf('youtubePlugin', 'txtStartAt');

							if (startSecs) {
								var seconds = hmsToSeconds(startSecs);

								params.push('start=' + seconds);
							}

							if (params.length > 0) {
								url = url + '?' + params.join('&');
							}

							if (true) { // This change was made so that it's always responsive
								content += '<div class="youtube-embed-wrapper" style="position:relative;padding-bottom:56.25%;padding-top:30px;height:0;overflow:hidden">';
								responsiveStyle = 'style="position:absolute;top:0;left:0;width:100%;height:100%"';
							}

							if (this.getContentElement('youtubePlugin', 'chkNoEmbed').getValue() === true) {
								var imgSrc = '//img.youtube.com/vi/' + video + '/sddefault.jpg';
								content += '<a href="' + url + '" ><img width="' + width + '" height="' + height + '" src="' + imgSrc + '" '  + responsiveStyle + '/></a>';
							}
							else {
								content += '<iframe width="' + width + '" height="' + height + '" src="' + url + '" ' + responsiveStyle;
								content += 'frameborder="0" allowfullscreen></iframe>';
							}

							if (true) { // This change was made so that it's always responsive
								content += '</div>';
							}
						}

						var element = CKEDITOR.dom.element.createFromHtml(content);
						var instance = this.getParentEditor();
						instance.insertElement(element);
					}
				};
			});
		}
	});
})();

function handleLinkChange(el, api) {
	var video = ytVidId(el.getValue());
	var time = ytVidTime(el.getValue());

	if (el.getValue().length > 0) {
		el.getDialog().getContentElement('youtubePlugin', 'txtEmbed').disable();
	}
	else {
		el.getDialog().getContentElement('youtubePlugin', 'txtEmbed').enable();
	}

	if (video && time) {
		var seconds = timeParamToSeconds(time);
		var hms = secondsToHms(seconds);
		el.getDialog().getContentElement('youtubePlugin', 'txtStartAt').setValue(hms);
	}
}

function handleEmbedChange(el, api) {
	if (el.getValue().length > 0) {
		el.getDialog().getContentElement('youtubePlugin', 'txtUrl').disable();
	}
	else {
		el.getDialog().getContentElement('youtubePlugin', 'txtUrl').enable();
	}
}


/**
 * JavaScript function to match (and return) the video Id
 * of any valid Youtube Url, given as input string.
 * @author: Stephan Schmitz <eyecatchup@gmail.com>
 * @url: http://stackoverflow.com/a/10315969/624466
 */
function ytVidId(url) {
	var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
	return (url.match(p)) ? RegExp.$1 : false;
}

/**
 * Matches and returns time param in YouTube Urls.
 */
function ytVidTime(url) {
	var p = /t=([0-9hms]+)/;
	return (url.match(p)) ? RegExp.$1 : false;
}

/**
 * Converts time in hms format to seconds only
 */
function hmsToSeconds(time) {
	var arr = time.split(':'), s = 0, m = 1;

	while (arr.length > 0) {
		s += m * parseInt(arr.pop(), 10);
		m *= 60;
	}

	return s;
}

/**
 * Converts seconds to hms format
 */
function secondsToHms(seconds) {
	var h = Math.floor(seconds / 3600);
	var m = Math.floor((seconds / 60) % 60);
	var s = seconds % 60;

	var pad = function (n) {
		n = String(n);
		return n.length >= 2 ? n : "0" + n;
	};

	if (h > 0) {
		return pad(h) + ':' + pad(m) + ':' + pad(s);
	}
	else {
		return pad(m) + ':' + pad(s);
	}
}

/**
 * Converts time in youtube t-param format to seconds
 */
function timeParamToSeconds(param) {
	var componentValue = function (si) {
		var regex = new RegExp('(\\d+)' + si);
		return param.match(regex) ? parseInt(RegExp.$1, 10) : 0;
	};

	return componentValue('h') * 3600
		+ componentValue('m') * 60
		+ componentValue('s');
}

/**
 * Converts seconds into youtube t-param value, e.g. 1h4m30s
 */
function secondsToTimeParam(seconds) {
	var h = Math.floor(seconds / 3600);
	var m = Math.floor((seconds / 60) % 60);
	var s = seconds % 60;
	var param = '';

	if (h > 0) {
		param += h + 'h';
	}

	if (m > 0) {
		param += m + 'm';
	}

	if (s > 0) {
		param += s + 's';
	}

	return param;
}
