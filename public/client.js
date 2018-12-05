$(document).ready(function(){
    $(document).ready(function(){
		$("#navBarIcon").hide();
    	$(".fa-clone").click(function(){
            $('.main-section').toggleClass("open-more");
			$("#navBarIcon").hide("slow");
			$("#chatIcon").show("slow");
        });
	});
	$(".left-first-section").click(function(){
            $('.main-section').toggleClass("open-more");
			$("#chatIcon").show("slow");
			$("#navBarIcon").hide("slow");
    });
	$("#chatIcon").click(function(){
		$("#chatIcon").hide("slow");
		$("#navBarIcon").show("slow");
		$('.main-section').toggleClass("open-more");
		
	});
});

function get_browser_info(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE ',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }
var browser=get_browser_info();
 
var random_num = null;
var div = $('.chat-section'), height = div.height();	
$('#serverTyping').hide();

  var socket = io.connect('http://localhost:8080');
  // The visitor is asked for their username...
  //var username = prompt('What\'s your username?');
	// It's sent with the signal "little_newbie" (to differentiate it from "message")
   socket.emit('little_newbie', "Sagar");
  // A dialog box is displayed when the server sends us a "message"
   socket.on('message', function(message) {
	   var startPos = message.indexOf("<id>");
	   if(startPos > 0){
		  	var endPos = message.indexOf("</id>");
			var id = message.slice(startPos+4,endPos);
			id = id +'^'+Math.floor(Math.random()*10000);
			message = message.slice(0,startPos);
			var startPosforIE = message.indexOf("<ForIE>");
			if(startPosforIE > 0){
				var endPosforIE = message.indexOf("</ForIE>");
				if (browser.name.trim() == "IE") {
					message = message.slice(0,endPosforIE);
									
				}else{
					message = message.slice(0,startPosforIE)+message.slice(endPosforIE+8); ;
					
				}
			}	 
			$('#addMessgae').append('<li><div class="left-chat"><p>'+message+'</p></div><div class="feedback" value='+id+'><span id="feedbackLike" href="" value='+id+'></span><span id="feedbackUnLike" href="" value='+id+'></span><div></li>');
		}else{
			
			$('#addMessgae').append('<li><div class="left-chat"><p>'+message+'</p></div></li>');
		}
		div.animate({scrollTop: height}, "slow");
		height += div.height();
		$('#serverTyping').hide(100);
		
    })
   // When the button is clicked, a "message" is sent to the server
   $('#sendMessage').submit(function (e) {
		e.preventDefault();
		var message = $('#inputmsg').val().trim();
		if (message == "" || message == null) {
			$('#serverTyping').html("<i class='isa_error'>Please enter the message</i>");
			$('#inputmsg').val("");
			$('#serverTyping').show(10);
			return false;
		}
		$('#inputmsg').val("");
		$('#addMessgae').append('<li><div class="right-chat"><p>'+message+'</p></div></li>');
		div.animate({scrollTop: height}, "slow");
		height += div.height();
		socket.emit('message', message);
		$('#serverTyping').html("<i class='isa_info'>Chatbot is typing...</i>");
		$('#serverTyping').show(100);
    })
	
	$(document).on("click", '#feedbackLike', function(event) { 
		var id = $(this).attr("value").split("^");
		random_num=id[1];
		socket.emit('feedback', id[0]+"|Liked");
	});
	
	$(document).on("click", '#feedbackUnLike', function(event) { 
		var id = $(this).attr("value").split("^");
		random_num=id[1];
		socket.emit('feedback', id[0]+"|UnLiked");
	});
	
	socket.on('feedback', function(message) {
		var val = message.split(';')[1];
		val = val +'^'+ random_num	;
		$('div[value="'+val+'"]').html(message.split(';')[0]);
	});
	
	$('#inputmsg').focus(function() {
		$('#serverTyping').hide();
	});
	
	$('#inputmsg').focus(function() {
		$('#serverTyping').hide();
	});
	
	$('.setQuestion').click(function() {
		if(!$('.main-section').hasClass('open-more')){
			$('.main-section').toggleClass("open-more");
			$("#navBarIcon").show("slow");
			$("#chatIcon").hide("slow");
		}
		$('#inputmsg').val(this.innerHTML);
	});
	
	function openNav() {
    document.getElementById("mySidenav").style.display = "block";
}

	function closeNav() {
    document.getElementById("mySidenav").style.display = "none";
}

$('.dropdown-btn').click(function() {
		var height = $(this).next().css("height");
		//alert(height);
		if(height === '0px')
			$(this).next().css("height","100%")
		else
			$(this).next().css("height","0px")
	 });
	 
$('#show_About').click(function() {
	$('video').each(function(){
		$(this)[0].pause();
	});
	$('.navbar').css("z-index", "-100000")
	
});

$('#close_About').click(function() {
	$('video').each(function(){
		$(this)[0].pause();
	});
	
	$('.navbar').css("z-index", "1")
});

const capture = () => {
    // add canvas element
    const canvas = document.createElement('canvas');
    document.querySelector('body').appendChild(canvas);

    // set canvas dimensions to video ones to not truncate picture
    const videoElement = document.querySelector('#stream video');
    canvas.width = videoElement.width;
    canvas.height = videoElement.height;

    // copy full video frame into the canvas
    canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

    // get image data URL and remove canvas
    const snapshot = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);

    // update grid picture source
    document.querySelector('#grid').setAttribute('src', snapshot);
};

getUserMedia({
	video: true,
	audio: false,
	width: 640,
	height: 480,
	el: 'stream', // render live video in #stream
	swffile: require('getusermedia-js/dist/fallback/jscam_canvas_only.swf'),
  }, stream => {
	  startVideo(stream);
	  document.getElementById('capture').addEventListener('click', () => {
		  capture();
		  stopVideo(stream);
	  });
  }, err => console.error(err));
	
	 



