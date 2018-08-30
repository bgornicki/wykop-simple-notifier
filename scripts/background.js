let settings = {
	soundsEnabled: true,
	soundsOnlyFirst: false,
	alwaysShowMainPage: false,
	elonizm: false,
	shouldCountHashtags: false,
	showRichNotifications: false,
	interval: 10
}

var checkingInterval_ms = 10000;
var audio = null;
var totalNotificationCount = 0;
var totalNotificationCountOld = 0;
var notificationCount = 0;
var hashtagsCounter = 0;
let intervalHandler = null;
var urlToOpenOnClick = "";
var notificationsShown = [];

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

	getUserSettings(function () {
		totalNotificationCount = 0;
		totalNotificationCountOld = 0;

		extensionSetTitle("Simple Wykop Notifier - uruchamianie");
		extensionSetBadge(COLOR_NOT_READY, "?");

		if (!chrome.browserAction.onClicked.hasListener(iconClickHandler)) {
			chrome.browserAction.onClicked.addListener(iconClickHandler);
		}

		clearTimeout(intervalHandler);
		intervalHandler = setTimeout(getNotifications, 1000);
	});
}

function getUserSettings(callback) {

	chrome.storage.sync.get(settings, function (readSettings) {
		
		settings = readSettings;
		
		if (settings.interval) {
			checkingInterval_ms = settings.interval * 1000;
		}

		if (settings.elonizm) {
			audio = new Audio('sounds/elon.ogg');
		} else {
			audio = new Audio('sounds/all-eyes-on-me.ogg');
		}

		if (callback) {
			callback();
		}

	});
}


function isNotificationFromTag(notificationObject) {
	return ((notificationObject.outerHTML.indexOf("użył tagu") > 0) || (notificationObject.outerHTML.indexOf("użyła tagu") > 0));
}

function getNotifications() {

	let req = new XMLHttpRequest();
	req.open('GET', 'https://www.wykop.pl/powiadomienia/', true);
	req.timeout = 500; // time in milliseconds 
	req.onreadystatechange = function (aEvt) {
		if (req.readyState == 4 && req.status == 200) {
			if (isUserLoggedIn(req.responseText)) {

				totalNotificationCount = getMentionsCount(req.responseText);
				if (settings.shouldCountHashtags) {
					totalNotificationCount += getHashtagsCount(req.responseText);
				}

				if (totalNotificationCount > totalNotificationCountOld) {
					if (settings.soundsEnabled) {
						if (settings.soundsOnlyFirst == false) {
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
					notificationCountString = totalNotificationCount.toString();
				} else {
					notificationCountString = "";
				}

				extensionSetBadge(COLOR_NEW_NOTIFICATION, notificationCountString);
				extensionSetTitle("Wykop - zalogowany: \n " + getMentionsCount(req.responseText) + " powiadomien\n " + getHashtagsCount(req.responseText) + " tagow");

				if (totalNotificationCount != 0) {
					var parser = new DOMParser();
					var responseDoc = parser.parseFromString(req.responseText, "text/html");
					var notificationList = responseDoc.getElementsByClassName("menu-list notification");

					if (notificationList.length > 0) {
						var notifications = notificationList[0].getElementsByTagName("li");
						for (var i = 0; i < notifications.length; ++i) {

							if ((notifications[i].classList.contains('type-light-warning')) && (!isNotificationFromTag(notifications[i]))) {
								collapse(notifications[i]);
								var links = notifications[i].getElementsByTagName("a");
								if (links.length > 0) {
									urlToOpenOnClick = links[links.length - 1].href;
								}

								if (settings.showRichNotifications) {
									if (!wasRichNotificationShown(urlToOpenOnClick)) {
										showRichNotification(notifications[i].innerText.trim(), urlToOpenOnClick);
									}
								}

							}
						}
					}
				} else {
					notificationsShown = [];
				}
			} else {
				extensionShowError("?");
			}
		}
	};
	req.send(null);

	clearTimeout(intervalHandler);
	intervalHandler = setTimeout(getNotifications, checkingInterval_ms);
}

function iconClickHandler(tab) {
	
	if (settings.alwaysShowMainPage) {
		openNewChromeTab("https://www.wykop.pl");
	} else if (totalNotificationCount == 0) {
		openNewChromeTab("https://www.wykop.pl");
	} else if (totalNotificationCount == 1) {
		if ((urlToOpenOnClick != null) && (urlToOpenOnClick != "")) {
			openNewChromeTab(urlToOpenOnClick);
		} else {
			openNewChromeTab("https://www.wykop.pl");
		}
	} else {
		openNewChromeTab("https://www.wykop.pl/powiadomienia");
	}
}

function extensionShowError(text) {
	extensionSetTitle("Wykop - niezalogowany");
	extensionSetBadge(COLOR_ERROR, "??");
}

function openNewChromeTab(address) {
	chrome.tabs.create({
		url: address
	});
}
function extensionSetTitle(text) {
	chrome.browserAction.setTitle({
		title: text
	});
}

function extensionSetBadge(color, text) {
	chrome.browserAction.setBadgeBackgroundColor(color);
	chrome.browserAction.setBadgeText({
		text: text
	});
}

function isUserLoggedIn(respose) {
	return (respose.indexOf("https://www.wykop.pl/zaloguj") < 0)
}

function getMentionsCount(response) {
	var counter = 0;
	var mentionsPattern = '(id="notificationsCount">)(\\d*)(</b>)';
	var bellPattern = '(id="pmNotificationsCount">)(\\d*)(</b>)';
	var mentionsQuery = new RegExp(mentionsPattern, ["i"]);
	var bellQuery = new RegExp(bellPattern, ["i"]);

	var mentionsResults = mentionsQuery.exec(response);
	var bellResults = bellQuery.exec(response);
	if (mentionsResults) {
		counter += parseInt(mentionsResults[2]);
	}
	if (bellResults) {
		counter += parseInt(bellResults[2]);
	}
	return counter;
}

function getHashtagsCount(response) {
	var hashtagsPattern = '(id="hashtagsNotificationsCount">)(\\d*)(</b>)';
	var hashtagsQuery = new RegExp(hashtagsPattern, ["i"]);

	var hashtagsResults = hashtagsQuery.exec(response);
	if (hashtagsResults) {
		return parseInt(hashtagsResults[2]);
	} else {
		return -1;
	}

}

function showRichNotification(text, link) {

	notificationsShown.push(link);

	var options = {
		icon: "../img/icon128.png",
		body: text
	}

	var notification = new Notification("Wykop.pl", options);

	notification.onclick = function () {

		deleteNotificationInfo(link);

		window.focus();
		chrome.tabs.create({
			url: link
		});
		notification.close();
	};
}

function wasRichNotificationShown(link) {
	var wasShown = false;

	for (let index = 0; index < notificationsShown.length; index++) {
		const element = notificationsShown[index];
		if (element == link) {
			wasShown = true;
		}
	}

	return wasShown;
}

function deleteNotificationInfo(link) {
	for (let i = 0; i < notificationsShown.length; i++) {
		const element = notificationsShown[i];
		if (element == link) {
			notificationsShown.splice(i, 1);
		}
	}
}