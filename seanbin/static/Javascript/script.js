// Start the Stanford JavaScript Crypto Library (SJCL) entropy collectors
sjcl.random.startCollectors();
var title = document.title;

var glyphClasses = {
	'dangers': 'glyphicon glyphicon-exclamation-sign',
	'warnings': 'glyphicon glyphicon-warning-sign',
	'infos': 'glyphicon glyphicon-info-sign'
}

$(document).keyup(function(e){
    if(e.keyCode == 27 && $("#modalPopup").css("display") == "block"){
    	$("#modalClose").trigger("click");
    	if (!$("#pw").val()) $("#pw").focus();
    }
    if(e.keyCode == 13){
    	if ($("#modalPopup").css("display") == "block"){
    		$("#modalClose").click();
    		if (!$("#pw").val()) $("#pw").focus();
    	}
    	else $("#Submit").click();
    }

});

function focusAlert(div){
	var color = $(div).css("background-color");
	$(div).animate({
		backgroundColor: '#59b4de solid'
	}, 500, function(){
		$(div).animate({
			backgroundColor: color
		}, 1000);

	});
}

function OpenModal() {
	if ($("#img").prop("src") != document.location.href) {
		var options = {
		            "backdrop" : "static",
		            "show":true
		}
		$('#modalPopup').modal(options);
	}
	else
		createAlert("Select an image!", "warnings");
}

function createAlert(e, type){
	console.log("type: "+type);
	console.log(e.message);
	var alerts = document.getElementById(type);
	if($("#"+type).is(':empty')) {

		var close = document.createElement("a");
		close.setAttribute("class", "close");
		close.setAttribute("id", type + "_close");
		close.setAttribute("aria-label", "close");
		close.innerHTML = "&times;";
		close.setAttribute("onclick", "clearAlerts($(this).parent());");
		alerts.appendChild(close);
	}
	var span = document.createElement("span");
	span.setAttribute("class", glyphClasses[type]);
	var div_error = document.createElement("div");
	div_error.setAttribute("class", "error");
	div_error.appendChild(span);
	div_error.appendChild(document.createTextNode(e));
	alerts.appendChild(div_error);
	focusAlert(div_error);
}

/*
	Generates a cryptographically secure password using the SJCL random number generator
*/
function OnGeneratePassword() {
	var form = document.getElementById("paste");

	// Check that enough entropy has been collected
	if (sjcl.random.isReady()) {
		try {
			// Populate the password with 12 random words encoded as a Base64 string equivalent to 64 characters
			form.password.value = sjcl.codec.base64.fromBits(sjcl.random.randomWords(12));
			form.password.focus();
		} catch (e) {
			createAlert(e);
		}
	} else {
		createAlert("Random number generator requires more entropy", 'warnings');
	}
}

/*
	Encrypts the plain text with the Advanced Encryption Standard (AES) and a 256-bit key size using SJCL
*/


function readURL(input){
	var max = 254842;
	file_size = input.files[0].size;
	var reader = new FileReader();
	reader.onload = function (evt) {
		file_data = evt.target.result;
		if (file_size <= max){
			$("#img")
				.attr('src', file_data)
	    		.width(538)
	    	var array = input.value.split("\\");
			var file_name = array[array.length-1];
			$("#title").text(file_name);
			$("#SlctBox").text(file_name);
			OpenModal()

    	} else{
            createAlert("Uploaded image is to large, submit a smaller one!", 'dangers');
            document.title = ""
    		
    	}
    };
    if (file_size < max) {
    	reader.readAsDataURL(input.files[0]);
    	$('#dangers').empty();
    } else {
    	reader.readAsDataURL(input.files[0]);
	}
}
function ResetImgFile() {
	file_data = null;
	var file = document.getElementById("imgfile");
	var Box = document.getElementById("SlctBox");
	file.value = "";
	Box.textContent = BoxValue;
}

function clearAlerts(parent) {
	parent.empty();
}

function clearAllAlerts() {
	$("#dangers").empty();
	$("#warnings").empty();
	$("#infos").empty();
}
function onEncrypt() {
	file_data = document.getElementById("img").src;
	var form = document.getElementById("paste");
	var image = document.getElementById("image");


	try{
        var file_content = file_data;
    } catch (e){

		if (e == "ReferenceError: file_data is not defined"){
			var error = "Choose an image to encrypt";
		} else {
			var error = "error: " + e;
		}
		createAlert(error, 'warnings');
		return false;
    }

	if (file_content.length > 0 && form.password.value.length > 0 && form.expiration.selectedIndex > 0 && file_content != document.location.href) {
		try {
			// Set the form elements as read-only to prevent accidental manipulation
			clearAllAlerts()
			setFormReadonly(true);

			file_content = sjcl.codec.base64.fromBits(sjcl.codec.utf8String.toBits(sjcl.encrypt(form.password.value, file_content, {ks: 256})));

			// Check that the cipher text is below the maximum character limit
			

			if (file_content.length < 607062) {
				
				form.password.value = null;

				// Submit the cipher text and expiration time
				$.ajax(
					{type: "post",
					url: $("#paste").attr("action"),
					data: JSON.stringify({"imgfile":file_content, "expiration":form.expiration.value}),
					dataType: "text",
				    success: function(data, textStatus, request) {
        				window.location.href = request.getResponseHeader("Location");
					},
					error: function (request, textStatus, errorThrown) {
        				console.log(errorThrown);
        				console.log(textStatus);
   					}
			});

			} else {
				// Reset the form elements as editable
				setFormReadonly(false);
				createAlert("Maximum file size exceede", 'dangers');
			}
		} catch (e) {
			createAlert(e.message, 'dangers');
		}
	} else {
		createAlert("One or more required fields were left clear", 'warnings');
	}
}



/*
	Decrypts the cipher text with AES using SJCL
*/
function onDecrypt(data) {
	var form = document.getElementById("view");
	var image = document.getElementById("cipherimg");

	// Validate the cipher text and password fields
	if (form.password.value.length > 0) {
		try {

			// Decrypt the Encrypted data using the password
			console.log("Decrypting image with sjcl");
			image.src = sjcl.decrypt(form.password.value, sjcl.codec.utf8String.fromBits(sjcl.codec.base64.toBits(data)), {ks: 256});
			
			$("#imgdiv").show();			
			var url = image.src.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
			// The download button click function will save the dectypted image to the local disk
			$('#downloadBtn').click(function(){
				var a = $("<a>")
    						.attr("href", url)
    						.attr("download", "image.jpeg")
    						.appendTo("body");
				a[0].click();
				a.remove();
			});

			// Clear all of the alerts in case of successful decrypting
			clearAllAlerts();
			form.password.value = null;
			$(".glyphicon-eye-open").hide();

		} catch (e) {
			// In case of decrypting error the image src will be removed to hide it
			image.removeAttribute('src');
			image.removeAttribute('style');
			$("#imgdiv").hide();
			url = null;
			// Create a danger error of the exception
			if (e.message == "ccm: tag doesn't match") createAlert("The provided password is not valid!", "dangers");
			else createAlert(e, 'dangers');
		}
	} else {
		createAlert("Enter password and try again!", 'warnings');
	}
}

function GetCipher(id){
	// Get the image cipher from the server dinamically with Ajax
    $.get("/ciphers/"+id, function(data, status){
        console.log("Status: " + status);
        onDecrypt(data);
    });
}


$(document).ready(function(){
	$.ajaxSetup({
        error: AjaxError
    });
});


function AjaxError(x, e) {
	// Function to handle ajax errors and status codes
	if (x.status == 0) {
		var error = 'Check Your Network.';
	} else if (x.status == 404) {
		var error = 'Not found, this paste may have expired.';
	} else {
	    var error = 'Unknown Error.\n' + x.responseText;
	}
	createAlert(error, 'dangers');
}
