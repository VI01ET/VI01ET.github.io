var video = document.getElementById('video');

navigator.mediaDevices.getUserMedia(
    {video: true}, function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    
    }, 
    function(error) {
        alert(error.name || error);
    
});
