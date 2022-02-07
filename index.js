let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let imageSubmit = document.getElementById("image-submit");
let rects = document.getElementById("rects");

function getPixel(data,x,y) {
	return [
    	data.data[4*(data.width * y + x)],
    	data.data[4*(data.width * y + x) + 1],
    	data.data[4*(data.width * y + x) + 2],
    	data.data[4*(data.width * y + x) + 3]
    ]
}

function mean(data) {
	return data.reduce((prev, cur) => prev + cur, 0) / data.length;
}

function stdev(data) {
	let meanOfData = mean(data);
    return Math.sqrt(data.reduce((prev, cur) => {
    	return prev + Math.pow(cur - meanOfData, 2);
    
    }, 0) / (data.length - 1));
}

imageSubmit.addEventListener("change", (e) => {
	if(e.target.files) {
      let imageFile = e.target.files[0]; //here we get the image file
      let reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = function (e) {
        let img = new Image(); // Creates image object
        img.src = e.target.result; // Assigns converted image to image object
        img.onload = function(ev) {
          canvas.width = img.width; // Assigns image's width to canvas
          canvas.height = img.height; // Assigns image's height to canvas
          ctx.drawImage(img,0,0); // Draws the image on canvas
        }
      }
    }
});

let clickPos1 = [];
let clickMode = "first";

canvas.addEventListener("click", (e) => {
	if (clickMode == "first") {
    	clickPos1 = [e.offsetX, e.offsetY];
        clickMode = "second"
    } else {
    	clickMode = "first";
        let imgData = ctx.getImageData(...clickPos1, e.offsetX, e.offsetY);
        let reds = [];
        let greens = [];
        let blues = [];
        let alphas = [];
        for (let y = 0; y < e.offsetY - clickPos1[1]; y++) {
            for (let x = 0; x < e.offsetX - clickPos1[0]; x++) {
				let px = getPixel(imgData, x, y);
                reds.push(px[0]);
                greens.push(px[1]);
                blues.push(px[2]);
                alphas.push(px[3]);
            }
        }
        //console.log(reds[0]);
        let rect = document.createElement("p");
        rect.innerHTML = 
        `#: ${rects.children.length},<br>
         Means = (
         ${Math.round(mean(reds)*100)/100}, 
         ${Math.round(mean(greens)*100)/100}, 
         ${Math.round(mean(blues)*100)/100}, 
         ${Math.round(mean(alphas)*100)/100})<br>
         Standard Deviations = (
         ${Math.round(stdev(reds)*100)/100}, 
         ${Math.round(stdev(greens)*100)/100}, 
         ${Math.round(stdev(blues)*100)/100}, 
         ${Math.round(stdev(alphas)*100)/100})<br>`;
         rects.appendChild(rect);
         ctx.strokeRect(clickPos1[0], clickPos1[1], e.offsetX - clickPos1[0], e.offsetY - clickPos1[1]);
         ctx.fillText(rects.children.length - 1, clickPos1[0] + 2, clickPos1[1] + 10);
    }
});