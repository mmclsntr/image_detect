const startCapturingButton = document.querySelector("#start-capturing");
const takeScreenshotsButton = document.querySelector("#take-screenshots");
//const downloadScreenshotsButton = document.querySelector("#download-screenshots");
const detectScreenshotsButton = document.querySelector("#detect-screenshots");
const videoScreenshot = document.querySelector("div#capture-stream video");
const canvasScreenshot = document.querySelector("div#screenshot canvas");
const canvasDetectOutput = document.querySelector("canvas#detect-result");

var canvasTemplate = document.querySelector('.template-image canvas');
// Image オブジェクトを生成
var img = new Image();
img.src = './template.png';
// 画像読み込み終了してから描画
img.onload = function(){
    var canvasRatio = canvasTemplate.height / canvasTemplate.width;
    var imgRatio = img.height / img.width;
    if (imgRatio <= canvasRatio) {
        var newW = canvasTemplate.width;
        var newH = canvasTemplate.width / img.width * img.height;
    } else {
        var newH = canvasTemplate.height;
        var newW = canvasTemplate.height / img.height * img.width;
    }
    canvasTemplate.width = img.width;
    canvasTemplate.height = img.height;
    canvasTemplate.getContext('2d').drawImage(img, 0, 0);
}

console.log(canvasScreenshot)
console.log(canvasTemplate)

let captureStream = null;
startCapturingButton.addEventListener('click', async () => {
    captureStream = await navigator.mediaDevices.getDisplayMedia({audio: false, video: true});
    //videoContainer.innerHTML = '';
    if (captureStream) {
        videoScreenshot.autoplay = true;
        videoScreenshot.srcObject = captureStream;
        takeScreenshotsButton.removeAttribute("disabled")
    }
});

takeScreenshotsButton.addEventListener('click', async () => {
    const videoTrack = captureStream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    const imageBitmap = await imageCapture.grabFrame();
    console.log('Grabbed frame:', imageBitmap);
    canvasScreenshot.width = imageBitmap.width;
    canvasScreenshot.height = imageBitmap.height;
    canvasScreenshot.getContext('2d').drawImage(imageBitmap, 0, 0);
    detectScreenshotsButton.removeAttribute("disabled")
});

// downloadScreenshotsButton.addEventListener('click', async () => {
//     const canvas = canvasContainer.querySelector('canvas');
//     var base64 = canvas.toDataURL("image/png");
//     downloadScreenshotsButton.href = base64;
// });
detectScreenshotsButton.addEventListener('click', async () => {
    const ss = await canvasScreenshot
    let src = cv.imread(ss);
    console.log(src)
    //cv.imshow(canvasDetectOutput, src)
    let templ = cv.imread(canvasTemplate);
    console.log(templ)
    let dst = new cv.Mat();
    let mask = new cv.Mat();
    cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask);
    console.log(dst)
    console.log(mask)
    let result = cv.minMaxLoc(dst, mask);
    console.log(result)
    let maxPoint = result.maxLoc;
    let color = new cv.Scalar(255, 0, 0, 255);
    let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
    cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
    cv.imshow(canvasDetectOutput, src);
    //src.delete(); dst.delete(); mask.delete();
});
