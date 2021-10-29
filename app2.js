var v = document.getElementById('camera');

function statVideo() {
    //定义一个全局的变量
    var mediaStreamTrack;
    debugger;
    // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            // 首先，如果有getUserMedia的话，就获得它
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

            // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // 否则，为老的navigator.getUserMedia方法包裹一个Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    const constraints = {
        video: true,
        audio: false
    };
    let videoPlaying = false;
    // let v = document.getElementById('camera');
    let promise = navigator.mediaDevices.getUserMedia(constraints);
    promise.then(stream => {
        // 旧的浏览器可能没有srcObject
        if ("srcObject" in v) {
            v.srcObject = stream;
        } else {
            // 防止再新的浏览器里使用它，应为它已经不再支持了
            v.src = window.URL.createObjectURL(stream);
        }
        v.onloadedmetadata = function (e) {
            v.play();
            videoPlaying = true;
            //用于关闭摄像头用
            mediaStreamTrack = typeof stream.stop === 'undefined' ? stream : stream.getTracks()[1];
                        
        };
    }).catch(err => {
        console.error(err.name + ": " + err.message);
    })

}


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./weights"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./weights"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./weights"),
    faceapi.nets.faceExpressionNet.loadFromUri("./weights"),
    
]).then(statVideo());

v.addEventListener("play", () =>{
    // 创建canvas信息
    const canvas = faceapi.createCanvasFromMedia(v);
    // 回填到body
    document.body.append(canvas);

    const displaySize = {
        width: v.width,
        height: v.height,
    };



    // 每隔100ms获取一次面部信息
    setInterval(async () => {
        const detections = await faceapi
        .detectAllFaces(v, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

        // 将实时面部数据和xx关联在一起
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // 去除残影
        canvas.getContext("2d").clearRect(0, 0 , canvas.width, canvas.height);

        // 绘制检测结果
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        

        // console.log(detections);
    }, 100)

    
}) 
 