let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let imageSubmit = document.getElementById("image-submit");
let rects = document.getElementById("rects");
let testType = document.getElementById('test-type').value;

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
      let minX = Math.min(clickPos1[0], e.offsetX);
      let maxX = Math.max(clickPos1[0], e.offsetX);
      let minY = Math.min(clickPos1[1], e.offsetY);
      let maxY = Math.max(clickPos1[1], e.offsetY);
    	clickMode = "first";
        let imgData = ctx.getImageData(minX, minY, maxX, maxY);
        let reds = [];
        let greens = [];
        let blues = [];
        let alphas = [];
        for (let y = 0; y < maxY - minY; y++) {
            for (let x = 0; x < maxX - minX; x++) {
				let px = getPixel(imgData, x, y);
                reds.push(px[0]);
                greens.push(px[1]);
                blues.push(px[2]);
                alphas.push(px[3]);
            }
        }
        //console.log(reds[0]);
        let rect = document.createElement("p");
        let rMean = Math.round(mean(reds)*100)/100;
        let gMean = Math.round(mean(greens)*100)/100;
        let bMean = Math.round(mean(blues)*100)/100;
        let aMean = Math.round(mean(alphas)*100)/100;
        testType = document.getElementById('test-type').value;
        //TODO: Change this so that it's based on user input
        //TODO: Average color values----------------------------------------
        if (testType == 'K') {
            arr = {};
        } else if (testType == 'P') {
            arr = {4: '(15.18, 83.51, 154.41, 255.00)', 3: '(39.29, 90.90, 140.68, 255.00)', 2: '(84.88, 109.85, 136.40, 255.00)', 1: '(106.21, 121.59, 132.81, 255.00)', 0: '(143.00, 139.73, 132.53, 255.00)'};
        } else if (testType == 'N') {
            arr = {4: '(173.32, 54.59, 121.72, 255.00)', 3: '(167.44, 71.61, 117.06, 255.00)', 2: '(166.82, 96.97, 117.98, 255.00)', 1: '(168.28, 114.71, 119.63, 255.00)', 0: '(173.00, 139.68, 130.39, 255.00)'};
        } else {
            arr = {7.5: '(8.44, 73.38, 23.30, 255)', 7.0: '(18.13, 103.61, 27.89, 255)', 6.5: '(116.75, 115.20, 18.17, 255)', 6.0: '(172.50, 146, 9.61, 255)', 5.5: '(217.62, 147.21, 6.21, 255)', 5.0: '(211.68, 95.28, 6.92, 255)', 4.5: '(207.45, 65.98, 7.23, 255)'};
        }
        //------------------------------------------------------------------
        rect.innerHTML = 
        `#: ${rects.children.length},<br>
         Means = (${rMean}, ${gMean}, ${bMean}, ${aMean})<br>
         Standard Deviations = (${Math.round(stdev(reds)*100)/100}, 
         ${Math.round(stdev(greens)*100)/100}, 
         ${Math.round(stdev(blues)*100)/100}, 
         ${Math.round(stdev(alphas)*100)/100})<br>
         ${testType}: ${getVal(`(${rMean}, ${gMean}, ${bMean}, ${aMean})`, arr)}`;
         rects.appendChild(rect);
         ctx.font = "24px Arial";
         ctx.lineWidth = 3;
         ctx.strokeStyle = "white";
         ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
         ctx.lineWidth = 1;
         ctx.strokeStyle = "black";
         ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
         ctx.lineWidth = 3;
         ctx.strokeStyle = "white";
         ctx.strokeText(rects.children.length - 1, minX + 12, minY + 30);
         ctx.fillStyle = "black";
         ctx.fillText(rects.children.length - 1, minX + 12, minY + 30);
    }
});

// Gets the nutrient value
function getVal(color, obj) {
    var results = {};
    var R = parseFloat((getR(color)));
    var G = parseFloat((getG(color)));
    var B = parseFloat((getB(color)));
    for (const property in obj) {
        var R2 = parseFloat((getR(obj[property])));
        var G2 = parseFloat((getG(obj[property])));
        var B2 = parseFloat((getB(obj[property])));
        results[property] = deltaE([R, G, B], [R2, G2, B2]);
    }
    var val = 0;
    var min = 100; //set to max value
    for (const property in results) {
        if (results[property] <= min) {
            min = results[property];
            val = property;
        }
    }
    //TODO: Nutrient requirements-------------------------------------------
    if (testType == 'K') {
        
    } else if (testType == 'P') {
        if (val < 3) {
            return(`${val}. You should raise P by ${3-val}.`)
        } else {
            return(`${val}. Your soil has sufficient P.`);
        }
    } else if (testType == 'N') {
        if (val < 3) {
            return(`${val}. You should raise N by ${3-val}.`)
        } else {
            return(`${val}. Your soil has sufficient N.`);
        }
    } else {
        if (val < 6) {
            return(`${val}. You should raise pH by ${6-val}.`)
        } else if (val > 7) {
            return(`${val}. You should lower pH by ${val-7}.`)
        } else {
            return(`${val}. Your soil has a sufficient pH.`);
        }
    }
    //----------------------------------------------------------------------
}

function getR(color) {
    var R = color.split('(')[1].split(',')[0];
    return R;
}

function getG(color) {
    var G = color.split('(')[1].split(', ')[1];
    return G;
}

function getB(color) {
    var B = color.split('(')[1].split(', ')[2];
    return B;
}

// Compares two RGB values to determine the difference
function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}
  
function rgb2lab(rgb){
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function avg() {
    let R = 0;
    let G = 0;
    let B = 0;
    let A = 255;
    for(i = 0; i < test.length; i++) {
        R+=parseFloat(getR(test[i]));
        G+=parseFloat(getG(test[i]));
        B+=parseFloat(getB(test[i]));
    }
    R/=test.length;
    G/=test.length;
    B/=test.length;
    return(`(${R.toFixed(2)}, ${G.toFixed(2)}, ${B.toFixed(2)}, ${A.toFixed(2)})`);
}