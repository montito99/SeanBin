// Start the Stanford JavaScript Crypto Library (SJCL) entropy collectors
sjcl.random.startCollectors();
var title = document.title;

var glyphClasses = {
	'dangers': 'glyphicon glyphicon-exclamation-sign',
	'warnings': 'glyphicon glyphicon-warning-sign',
	'infos': 'glyphicon glyphicon-info-sign'
}

$(document).keyup(function(ev){
    if(ev.keyCode == 27 && $("#modalPopup").css("display") == "block")
    	$("#modalClose").trigger("click");
    
    if(ev.keyCode == 13)
    	if ($("#modalPopup").css("display") == "block")
    		$("#modalClose").trigger("click");
    	else
    		$("#Submit").trigger("click");
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
		createError("Select an image!", "warnings");
}

function createError(e, type){
	console.log("type: "+type);
	console.log(e);
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
            createError("Uploaded image is to large, submit a smaller one!", 'dangers');
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
	var file = document.getElementById("imgfile");
	var Box = document.getElementById("SlctBox");
	file.value = "";
	file_data = "";
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
		createError(error, 'warnings');
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
				// Clear the password and plain text as a security measure
				form.password.value = null;

				// Delete the password completely before submitting any data
				// form.password.remove();
				// image.innerHTML = '<textarea name="imgfile"></textarea>';
				// image.removeAttribute('class');
				// image.style.display = "none";

				// Submit the cipher text and expiration time

				console.log( JSON.stringify( {"imgfile":file_content, "expiration":form.expiration.value} ) );
				$.ajax(
					{type: "post",
					url: "/go",
					data: JSON.stringify({"imgfile":file_content, "expiration":form.expiration.value}),
					dataType: "text",
				    success: function(data, textStatus, request) {
				    	console.log(data);
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
				createError("Maximum file size exceede", 'dangers');
			}
		} catch (e) {
			createError(e, 'dangers');
		}
	} else {
		createError("One or more required fields were left clear", 'warnings');
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
			
			// If the download button doesn't exist after successful decrypting then it will be created
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
			
			var url = image.src.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
			// The download button click function will save the dectypted image to the local disk
			$('#downloadBtn').click(function(){
				var a = document.createElement('a');
				a.setAttribute('href', url);
				a.setAttribute('download', 'image.jpeg');
				form.appendChild(a);
				a.click();
			});

			// Clear the danger alerts in case of successful decrypting
			clearAllAlerts();
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

function decrypt(id){
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
	createError(error, 'dangers');
}