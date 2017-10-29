function init() {
	
	// enable tooltips on all elements
	$('[data-toggle="tooltip"]').tooltip({
		trigger: 'hover'
	});

	document.getElementById('save').addEventListener('click', saveSettings);
	document.getElementById('linkedin').addEventListener('click', linkedInClick);

	// Read settings or Use default value in case of error
	chrome.storage.sync.get({
		soundsEnabled: true,
		soundsOnlyFirst: false,
		shouldCountHashtags: false,
		elonizm: false,
		openMentionsPage: false,
		interval: 10
	}, function(items) {
		document.getElementById('soundsEnabled').checked = items.soundsEnabled;
		document.getElementById('soundsOnlyFirst').checked = items.soundsOnlyFirst;
		document.getElementById('shouldCountHashtags').checked = items.shouldCountHashtags;
		document.getElementById('elonizm').checked = items.elonizm;
		document.getElementById('openMentionsPage').checked = items.openMentionsPage;
		document.getElementById('interval').value = items.interval;
	});
}

function saveSettings() {

	var intervalElement = document.getElementById("interval");
	var interval = intervalElement.value;

	if(interval >= 1 && interval <= 3600)
	{
		var soundsEnabled = document.getElementById("soundsEnabled").checked;
		var soundsOnlyFirst = document.getElementById("soundsOnlyFirst").checked;
		var shouldCountHashtags = document.getElementById("shouldCountHashtags").checked;
		var elonizm = document.getElementById("elonizm").checked;
		var openMentionsPage = document.getElementById("openMentionsPage").checked;

		chrome.storage.sync.set({
			soundsEnabled: soundsEnabled,
			soundsOnlyFirst: soundsOnlyFirst,
			shouldCountHashtags: shouldCountHashtags,
			elonizm: elonizm,
			openMentionsPage: openMentionsPage,
			interval: interval
		}, function() {
			// Update status to let user know options were saved.
			intervalElement.classList.remove("is-invalid");
			var status = document.getElementById('status');
			status.textContent = 'Ustawienia zapisane.';
			setTimeout(function() {
				status.textContent = '';
			}, 750);

			chrome.extension.getBackgroundPage().init();
		});	
	}
	else
	{
		intervalElement.classList.add("is-invalid");
	}
}

function linkedInClick() {
	_gaq.push(['_trackEvent', 'LinkedInButton', 'clicked']);
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-108401299-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

document.addEventListener('DOMContentLoaded', init);