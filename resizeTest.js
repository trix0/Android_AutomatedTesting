const fs=require("fs");
const cv = require('opencv4nodejs');

let img = cv.imread(__dirname+'/autoTest/RescaleTest.png');
let result=img.rescale(0.375)
cv.imwrite( "rescaledimg2.png", result );