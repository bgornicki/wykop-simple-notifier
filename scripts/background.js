var checkingInterval_ms = 10000;

var audio = null;

var totalNotificationCount = 0;
var totalNotificationCountOld = 0;
var notificationCount = 0;
var hashtagsCounter = 0;
var elonizm = false;

var soundsEnabled = false;
var soundsOnlyFirst = false;
var openMentionsPage = false;
var shouldCountHashtags = false;
var interval = 10;

var COLOR_NEW_NOTIFICATION = {
	color: [204, 0, 51, 255]
};
var COLOR_ERROR = {
	color: [204, 0, 51, 255]
};
var COLOR_NOT_READY = {
	color: [204, 204, 51, 255]
};
var COLOR_LOGGEDOUT = {
	color: [135, 141, 150, 255]
};

window.onload = init;

function init() {

	getUserSettings();

	totalNotificationCount = 0;
	totalNotificationCountOld = 0;
	chrome.browserAction.setTitle({
		title: "Simple Wykop Notifier - uruchamianie"
	});
	chrome.browserAction.setBadgeBackgroundColor(COLOR_NOT_READY);
	chrome.browserAction.setBadgeText({
		text: "?"
	});

	if (chrome.browserAction.onClicked.hasListener(clickListener) == false) {
		chrome.browserAction.onClicked.addListener(clickListener);
	}

	setTimeout(getNotifications, 1000);
}

function getUserSettings() {
	// Use default value
	chrome.storage.sync.get({
		soundsEnabled: true,
		soundsOnlyFirst: false,
		openMentionsPage: false,
		elonizm: false,
		shouldCountHashtags: false,
		interval: 10
	}, function(items) {
		soundsEnabled = items.soundsEnabled;
		soundsOnlyFirst = items.soundsOnlyFirst;
		shouldCountHashtags = items.shouldCountHashtags;
		elonizm = items.elonizm;
		openMentionsPage = items.openMentionsPage;
		interval = items.interval;

		if (interval) {
			checkingInterval_ms = interval * 1000;
		}

		if (elonizm) {
			audio = new Audio('sounds/elon.ogg');
		} else {
			audio = new Audio('sounds/all-eyes-on-me.ogg');
		}
	});
}

function getNotifications() {
	var req = new XMLHttpRequest();
	req.open('GET', 'https://www.wykop.pl', true);
	req.onreadystatechange = function(aEvt) {
		if (req.readyState == 4) {
			if (req.status == 200) {

				if (req.responseText.indexOf("https://www.wykop.pl/zaloguj") < 0) {

					var mentionsPattern = '(id="notificationsCount">)(\\d*)(</b>)';
					var hashtagsPattern = '(id="hashtagsNotificationsCount">)(\\d*)(</b>)';

					var mentionsQuery = new RegExp(mentionsPattern, ["i"]);
					var hashtagsQuery = new RegExp(hashtagsPattern, ["i"]);

					var mentionsResults = mentionsQuery.exec(req.responseText);
					var hashtagsResults = hashtagsQuery.exec(req.responseText);

					if (mentionsResults) {

						totalNotificationCount = parseInt(mentionsResults[2]);
						if (shouldCountHashtags) {
							if (hashtagsResults) {
								totalNotificationCount += parseInt(hashtagsResults[2]);
							}
						}

						if (totalNotificationCount > totalNotificationCountOld) {
							if (soundsEnabled) {
								if (soundsOnlyFirst == false) {
									audio.play();
								} else {
									if (totalNotificationCountOld == 0) {
										audio.play();
									}
								}
								totalNotificationCountOld = totalNotificationCount;
							}
						} else {
							totalNotificationCountOld = totalNotificationCount;
						}

						if (totalNotificationCount != 0) {
							totalNotificationCountText = totalNotificationCount.toString();
						} else {
							totalNotificationCountText = "";
						}

						chrome.browserAction.setBadgeBackgroundColor(COLOR_NEW_NOTIFICATION);
						chrome.browserAction.setBadgeText({
							text: totalNotificationCountText
						});

						if (hashtagsResults && mentionsResults) {
							chrome.browserAction.setTitle({
								title: "Wykop - zalogowany:\n " + mentionsResults[2] + " powiadomien\n " + hashtagsResults[2] + " tagow"
							});

						}

					} else {
						chrome.browserAction.setTitle({
							title: "Wykop - niezalogowany"
						});
						chrome.browserAction.setBadgeBackgroundColor(COLOR_ERROR);
						chrome.browserAction.setBadgeText({
							text: "?"
						});
					}
				} else {
					chrome.browserAction.setTitle({
						title: "Wykop - niezalogowany"
					});
					chrome.browserAction.setBadgeBackgroundColor(COLOR_LOGGEDOUT);
					chrome.browserAction.setBadgeText({
						text: "??"
					});
				}

				setTimeout(getNotifications, checkingInterval_ms);

			} else {
				chrome.browserAction.setTitle({
					title: "Wykop - niezalogowany"
				});
				chrome.browserAction.setBadgeText({
					text: "???"
				});
				setTimeout(getNotifications, checkingInterval_ms);
			}
		}
	};
	req.send(null);
}

function clickListener(tab) {
	iconClickReport();
	if (openMentionsPage) {
		chrome.tabs.create({
			url: "https://www.wykop.pl/powiadomienia/do-mnie"
		});
	} else {
		chrome.tabs.create({
			url: "https://www.wykop.pl"
		});
	}
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-108401299-2']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();

function iconClickReport() {
	_gaq.push(['_trackEvent', 'Icon', 'clicked']);
}