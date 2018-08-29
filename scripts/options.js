let settings = {
	soundsEnabled: true,
	soundsOnlyFirst: false,
	alwaysShowMainPage: false,
	elonizm: false,
	shouldCountHashtags: false,
	showRichNotifications: false,
	interval: 10
}

function init() {
	
	// enable tooltips on all elements
	$('[data-toggle="tooltip"]').tooltip({
		trigger: 'hover'
	});

	document.getElementById('save').addEventListener('click', saveSettings);
	document.getElementById('showRichNotifications').addEventListener('click', askForPermissionsIfNecessary);

	// Read settings or Use default value in case of error
	chrome.storage.sync.get(settings, function(items) {
		document.getElementById('soundsEnabled').checked = items.soundsEnabled;
		document.getElementById('soundsOnlyFirst').checked = items.soundsOnlyFirst;
		document.getElementById('shouldCountHashtags').checked = items.shouldCountHashtags;
		document.getElementById('elonizm').checked = items.elonizm;
		document.getElementById('alwaysShowMainPage').checked = items.alwaysShowMainPage;
		document.getElementById('showRichNotifications').checked = items.showRichNotifications;
		document.getElementById('interval').value = items.interval;
	});
}

function askForPermissionsIfNecessary() {

	var checkBox = document.getElementById("showRichNotifications");
	if (checkBox.checked == true) {
		if (!("Notification" in window)) {
			console.log("Twoja przeglądarka nie wspiera powiadomień");
		}

		else if ((Notification.permission !== "granted" && Notification.permission !== 'denied') || Notification.permission === "default") {
			Notification.requestPermission(function (permission) {
				if (permission === "granted") {
					var options = {
						icon: "../img/icon128.png",
						body: "Super, od teraz będziesz mógł korzystać z powiadomień!"
					}

					var notification = new Notification("Wykop.pl", options);
				}
			});
		}
	}
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
		var alwaysShowMainPage = document.getElementById("alwaysShowMainPage").checked;
		var showRichNotifications = document.getElementById("showRichNotifications").checked;

		chrome.storage.sync.set({
			soundsEnabled: soundsEnabled,
			soundsOnlyFirst: soundsOnlyFirst,
			shouldCountHashtags: shouldCountHashtags,
			elonizm: elonizm,
			alwaysShowMainPage: alwaysShowMainPage,
			showRichNotifications: showRichNotifications,
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

document.addEventListener('DOMContentLoaded', init);