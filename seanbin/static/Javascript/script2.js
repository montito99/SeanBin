/*
	Helper functions
*/


function getElapsedTime(time) {
	var seconds = Date.now() / 1000 - time;

	var minutes = seconds / 60;
	seconds %= 60;

	var hours = minutes / 60;
	minutes %= 60;

	var days = hours / 24;
	hours %= 24;

	var weeks = days / 7;
	days %= 7;

	var years = weeks / 52;
	weeks %= 52;

	var elapsedTime = "";

	if (years >= 1) {
		elapsedTime += Math.floor(years) + "y ";
	}

	if (weeks >= 1 || elapsedTime) {
		elapsedTime += Math.floor(weeks) + "w ";
	}

	if (days >= 1 || elapsedTime) {
		elapsedTime += Math.floor(days) + "d ";
	}

	if (hours >= 1 || elapsedTime) {
		elapsedTime += Math.floor(hours) + "h ";
	}

	if (minutes >= 1 || elapsedTime) {
		elapsedTime += Math.floor(minutes) + "m ";
	}

	if (seconds >= 1 || elapsedTime) {
		elapsedTime += Math.floor(seconds) + "s";
	}

	return elapsedTime;
}

function startElapsedTimer(time) {
	setInterval(function() {
		document.getElementById("time").innerHTML = getElapsedTime(time);
	}, 1000);
}

function setFormReadonly(readonly) {
	var form = document.getElementById("paste");

	for (var i = form.elements.length - 1; i--;) {
		form.elements[i].readOnly = readonly;
	}
}

function setPasswordVisible(visible) {
	var form = document.getElementById("paste");
	form.password.type = visible ? "text" : "password";
}

function ResetImgFile() {
	var file = document.getElementById("imgfile");
	var Box = document.getElementById("SlctBox");
	file.value = "";
	document.getElementById("img").src = "";
	Box.innerHTML = BoxValue;
}