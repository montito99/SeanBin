// Start the Stanford JavaScript Crypto Library (SJCL) entropy collectors
sjcl.random.startCollectors();
var title = document.title;

var glyphClasses = {
	'dangers': 'glyphicon glyphicon-exclamation-sign',
	'warnings': 'glyphicon glyphicon-warning-sign',
	'infos': 'glyphicon glyphicon-info-sign'
}

class FileType {
	constructor(signs, extension) {
		this.signs = signs;
		this.extension = extension;
		this.IsContPrefix = function(d) {
			return this.signs.some(function(e,i,a) { return d.startsWith(e); });
		}
	}
}

var fileTypes = [
	new FileType(["\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"], "png"),
	new FileType(["\xFF\xD8\xFF\xE0", "\xFF\xD8\xFF\xE1"], "jpg")
];

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
    	$('#dangers').empty();
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
	Encrypts the file with the Advanced Encryption Standard (AES) and a 256-bit key size using SJCL
*/


function readURL(input){
	var max = 254842;
	if (!input.files[0]) {
    	ResetImgFile();
    	createAlert("Please choose an image", "warnings");
    	return false;
	}

	file_size = input.files[0].size;

    var URIReader = new FileReader();
	URIReader.onload = function (evt) {
		file_data = evt.target.result;
		if (file_size <= max){
			console.log("image is below the max size");
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
            documet.title = title;
    		ResetImgFile();
    	}
    };
	var ByteReader = new FileReader();
    ByteReader.onload = function(evt) {
		var bytes = evt.target.result;
		console.log(bytes);
		var imgType = "";
		fileTypes.forEach(function(t, i, a) { console.log(t.signs, t.IsContPrefix(bytes)); if (t.IsContPrefix(bytes)) imgType = t.extension;})
		console.log(imgType)
		if (!imgType) {
    		createAlert("The selected file is not an image, submit a valid image file!", 'dangers');
			ResetImgFile();
			bytes = "";
		} else {
			$("input[name=bytesdigest").val(bytes);
	    	URIReader.readAsDataURL(input.files[0]);
	    }
    };
        


    if (file_size < max) {
    	ByteReader.readAsBinaryString(input.files[0]);
    } else {
    	createAlert("Uploaded image is to large, submit a smaller one!", 'dangers');
	}
}
function ResetImgFile() {
	file_data = null;
	var file = document.getElementById("imgfile");
	var Box = document.getElementById("SlctBox");
	file.value = "";
	Box.textContent = BoxValue;
	$("#modalClose").trigger("click");
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
	var form = document.getElementById("paste");

	if ($("#img").attr('src') && form.password.value.length > 0 && form.expiration.selectedIndex > 0) {
		try {
			// Set the form elements as read-only to prevent accidental manipulation
			clearAllAlerts()
			setFormReadonly(true);

			var file_name = $("#title").text();
			var cipher = sjcl.codec.base64.fromBits(sjcl.codec.utf8String.toBits(sjcl.encrypt(form.password.value, $("#img").attr('src') + "\r\n" + file_name, {ks: 256})));

			// Check that the cipher text is below the maximum character limit

			if (cipher.length < 607062) {
				
				form.password.value = null;

				// Submit the cipher text and expiration time
				$.ajax(
					{type: "post",
					url: $("#paste").attr("action"),
					data: JSON.stringify({"imgfile":cipher, "expiration":form.expiration.value}),
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

			var decrypted = sjcl.decrypt(form.password.value, sjcl.codec.utf8String.fromBits(sjcl.codec.base64.toBits(data)), {ks: 256});
			var array = decrypted.split("\r\n");

			image.src = array[0];
			document.title = array[1];
			$("#imgdiv").show();
			var url = image.src.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
			// The download button click function will save the dectypted image to the local disk
			$('#downloadBtn').click(function(){
				var a = $("<a>")
    						.attr("href", url)
    						.attr("download", array[1])
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
		$("#imgdiv").hide();
	}
}

function GetCipher(id){
	if (!CipherData) {
	// Get the image cipher from the server dinamically with Ajax
	    $.get("/ciphers/"+id, function(data, status){
	        console.log("Status: " + status);
	        CipherData = data;
	        onDecrypt(data);
	    });
	} else onDecrypt(CipherData);
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
