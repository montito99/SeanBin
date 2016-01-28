// Start the Stanford JavaScript Crypto Library (SJCL) entropy collectors
sjcl.random.startCollectors();

var glyphClasses = {
	'dangers' : "glyphicon glyphicon-exclamation-sign",
	'warnings' : 'glyphicon glyphicon-warning-sign'
}

$.fn.focusAlert = function(div){
	var color = $(div).css("background-color");
	$(div).animate({
		backgroundColor: '#59b4de solid'
	}, 500, function(){
		$(div).animate({
			backgroundColor: color
		}, 1000);

	});
}

function createError(e, type){
	console.log("type: "+type);
	console.log(e);
	var alerts = document.getElementById(type);
	if($("#"+type).is(':empty')) {
	// <a class="close" aria-label="close" onclick="bla(this);">&times;</a>
		var close = document.createElement("a");
		close.setAttribute("class", "close");
		close.setAttribute("id", type + "_close");
		close.setAttribute("aria-label", "close");
		close.innerHTML = "&times;";
		close.setAttribute("onclick", "bla(this);");
		alerts.appendChild(close);
	}
	var span = document.createElement("span");
	span.setAttribute("class", glyphClasses[type]);
	var div_error = document.createElement("div");
	div_error.setAttribute("class", "error");
	div_error.appendChild(span);
	div_error.appendChild(document.createTextNode(e));
	alerts.appendChild(div_error);
	$.fn.focusAlert(div_error);
}

/*
	Generates a cryptographically secure password using the SJCL random number generator
*/
function onGeneratePassword() {
	var form = document.getElementById("paste");
	var error = document.getElementById("error");

	// Check that enough entropy has been collected
	if (sjcl.random.isReady()) {
		try {
			// Populate the password with 12 random words encoded as a Base64 string equivalent to 64 characters
			form.password.value = sjcl.codec.base64.fromBits(sjcl.random.randomWords(12));
			form.password.select();
		} catch (e) {
			createError(e);
		}
	} else {
		createError("Random number generator requires more entropy", 'warnings');
	}
}

/*
	Encrypts the plain text with the Advanced Encryption Standard (AES) and a 256-bit key size using SJCL
*/


function readURL(input){
	var max = 260000;
	file_size = input.files[0].size;
	console.log(file_size);
	var reader = new FileReader();
    var options = {
	            "backdrop" : "static",
	            "show":true
	}
	reader.onload = function (evt) {
		file_data = evt.target.result;
		console.log("img src: " + file_data);
		$("#img")
			.attr('src', file_data)
    		.width(538)
    	if (file_size > max) {
    		$("img").attr('src', jic.compress(document.getElementById("img"), 260000/file_size));
    		window.open(document.getElementById("img").src);
    		file_data = document.getElementById("img").src;
    	}
		$("#title").text(input.value);
		array = input.value.split("\\");
		$("#basic-addon1").text(array[array.length-1]);
		$('#modalPopup').modal(options);
    };
    if (file_size < max) {
    	reader.readAsDataURL(input.files[0]);
    	$('#dangers').empty();
    } else {
    	reader.readAsDataURL(input.files[0]);
	}
}

var ids = {
	'dangers_close': 'dangers',
	'warnings_close': 'warnings'
}
function bla(button) {
	$("#"+ids[button.getAttribute('id')]).empty();
}
$.fn.checkSize = function(url){
	size = 0;
	$.ajax({
		async: false,
		type: 'HEAD',
		url: url ,
		complete: function(xhr) {
			console.log('Content-Length: ' + xhr.getResponseHeader('Content-Length'));
			// size = xhr.getResponseHeader('Content-Length');
			size = 5;
			console.log(size);
		}
	});

	// console.log(5);
	return size;
}

function onEncrypt() {
	var form = document.getElementById("paste");
	var image = document.getElementById("image");


	try{
		console.log(file_data);
        var file_content = file_data;
    } catch (e){

		if (e == "ReferenceError: file_data is not defined"){
			var error = "Choose an image to encrypt";
		} else {
			var error = "error: " + e;
		}
		createError(error, 'warnings');
		return false;
    }
	// Validate the plain text, password and expiration fields
	if (file_content.length > 0 && form.password.value.length > 0 && form.expiration.selectedIndex > 0) {
		try {
			// Set the form elements as read-only to prevent accidental manipulation
			
			setFormReadonly(true);

			// Encrypt the plain text using the password to a Base64 string
			// console.log(file_content);
			console.log("file size after compression: " + $.fn.checkSize(document.getElementById("img").src));
			file_content = sjcl.codec.base64.fromBits(sjcl.codec.utf8String.toBits(sjcl.encrypt(form.password.value, file_content, {ks: 256})));

			// Check that the cipher text is below the maximum character limit
			

			if (file_content.length < 26000000) {
				// Clear the password and plain text as a security measure
				form.password.value = null;

				// Delete the password completely before submitting any data
				form.password.remove();
				image.innerHTML = '<textarea name="imgfile"></textarea>';
				form.imgfile.value = file_content;
				// Submit the cipher text and expiration time
				// form.submit();

			} else {
				// Reset the form elements as editable
				setFormReadonly(false);
				// console.log(file_content.length);
				createError("Maximum file size exceeded", 'dangers');
			}
		} catch (e) {
			createError(e, 'dangers');
		}
	} else {
		createError("One or more required fields were left blank", 'warnings');
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
			
			// if the download button doesn't exist after successful decrypting then it will be created
			if (!document.getElementById('downloadBtn')){
				var button = document.createElement('button');
				button.setAttribute('class', "btn btn-defualt");
				button.setAttribute('id', 'downloadBtn');
				button.setAttribute('type', 'button');

				// Add the save glyphicon to the download button
				var glyphspan = document.createElement('span');
				glyphspan.setAttribute('class', "glyphicon glyphicon-save");
				button.appendChild(glyphspan);
				imgdiv = document.getElementById('imgdiv');
				imgdiv.insertBefore(button, imgdiv.firstChild);
			}
			
			// The download button click function will save the dectypted image to the local disk
			$('#downloadBtn').click(function(){
				var url = image.src.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
				var a = document.createElement('a');
				a.setAttribute('href', url);
				a.setAttribute('download', 'image.jpeg');
				form.appendChild(a);
				a.click();
			});

			// Clear the danger alerts in case of successful decrypting
			$('#dangers').empty();
			form.password.value = null;

		} catch (e) {
			// In case of decrypting error the image src will be removed to hide it
			image.removeAttribute('src');
			image.removeAttribute('style');

			// Create a danger error of the exception
			createError(e, 'dangers');
		}
	} else {
		createError("Enter password and try again!", 'warnings');
	}
}

$.fn.decrypt = function(id){
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
		var error = '  Check Your Network.';
	} else if (x.status == 404) {
    	var error = 'Not found, this paste may have expired.';
	} else {
	    var error = 'Unknow Error.\n' + x.responseText;
	}
	createError(error, 'dangers');
}