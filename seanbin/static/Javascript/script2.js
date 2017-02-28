/*
	Helper functions
*/
$(document).ready(function(){
	var clicked=false;
	$("#pw").keydown(function(e){
		setPasswordVisible(false);
		if($(this).val()) $(".glyphicon-eye-open").show();
		else $(".glyphicon-eye-open").hide();
		
	}).keypress(function(e){
		var keyCode = e.keyCode || e.which;
		if (keyCode === 13) return false;
	}).mouseup(function(e){
		e.stopPropagation();
		if (clicked){
			$("#pw").focus();
			clicked = false
			setPasswordVisible(false);
		}
	});

	$(document).mouseup(function(){
		$(".glyphicon-eye-open").hide();
		setPasswordVisible(false);
		if (clicked) {
			$("#pw").focus();
			clicked = false
		}

	});

	$("#genpw").click(function(e)
	{
		e.stopPropagation();
		$('.glyphicon-eye-open').show();
		$("#pw").focus();
		onGeneratePassword();
	});
	
	$(".glyphicon-eye-open").mousedown(function(e){
		e.stopPropagation();
		setPasswordVisible(true);
		clicked = true;
	}).mouseup(function(e){
		e.stopPropagation();
		setPasswordVisible(false);
		var val = $("#pw").val();
		$("#pw").val(val);
		$("#pw").focus();
		clicked = false;
	});

	$("#pwcol")
		.mouseover(function(e){
			e.stopPropagation();
			if($("#pw").val()) $(".glyphicon-eye-open").show();
			else if (!clicked) $(".glyphicon-eye-open").hide();
		}).mouseout(function(){
			if (!clicked) $(".glyphicon-eye-open").hide();
		}).mouseup(function(e){
			e.stopPropagation();
		});

})


function onGeneratePassword() {
	var form = document.getElementById("paste");
	// Check that enough entropy has been collected
	if (sjcl.random.isReady()) {
		try {
			// Populate the password with 12 random words encoded as a Base64 string equivalent to 64 characters
			form.password.value = sjcl.codec.base64.fromBits(sjcl.random.randomWords(12));
		} catch (e) {
			createAlert(e.messege, "dangers");
		}
	} else {
		createAlert("Random number generator requires more entropy", "dangers");
	}
}

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
	$("#pw").attr("type", visible ? "text" : "password");
}
	
function ResetImgFile() {
	var file = document.getElementById("imgfile");
	var Box = document.getElementById("SlctBox");
	file.value = "";
	document.getElementById("img").src = "";
	Box.innerHTML = BoxValue;
}

