var http = require('http');
var querystring = require('querystring');
var Rotator = require('matrix-rotator').MatrixRotator;
var Matrix = require("../data/matrix.js");
var DIRECTION = require("matrix-rotator/Direction.js");
var PORT = 1337;
var IP_ADDRESS  = '10.0.1.65';
var success = false;
var trackMatrix = null;
var solutionQueue = [];

function connectedToServer(response) {

  var outputBody = "";

  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));

  response.setEncoding('utf8');

  response.on('data', function (chunk) {

    outputBody = JSON.parse(chunk);
  });

  response.on("end", function() {

    console.log("disconnected from server");


    console.log(outputBody);

    if(outputBody.success === true) {

      console.log("SUCCESS!");
      success = true;
      console.log(trackMatrix);

    } else {

      if(solutionQueue.length > 0) {
        // var sourceMatrix = Matrix.getMatrix();

        testKey(sourceMatrix);
      }
    }
  });

  response.on("error", function(error) {

    console.log("server reported an error : " + error);
    throw error;
  });
};

function checkLayerRotations(layers, matrix) {

  // console.log(layers);

  var rotations = (((layers * 2) + Math.floor(matrix.length%2))-1) * 4;
  var rotator = null;

  for(var i = 0; i < rotations; i++) {

    //rotate matrix
    rotator = new Rotator(matrix);
    rotator.rotateStep(DIRECTION.Direction.CW, layers);
    matrix = rotator.matrix;

    // console.log(matrix);
    //test key
    solutionQueue.push(matrix);

    if (solutionQueue.length > 100) {

      testKey(dequeue());
    }

    if(layers - 1 > 0) {

      matrix = checkLayerRotations(layers - 1, matrix);
    }
  }

  return matrix;
};

function dequeue() {

  if(solutionQueue.length > 0) {

    return solutionQueue.shift();

  } else {

    return false;
  }
};

function testKey(matrix) {

  var postData = "key=" + matrix.toString();

  var options = {

    host: IP_ADDRESS,
    port: PORT,
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var server = http.request(options, connectedToServer);

  server.write(postData);
};

var sourceMatrix = Matrix.getMatrix();

// console.log(sourceMatrix);

// var rotator = new Rotator(sourceMatrix);
// rotator.rotateStep(DIRECTION.Direction.CW, 6);

// console.log(rotator.matrix);

// console.log(sourceMatrix);
var layers = Math.floor(sourceMatrix.length/2);

testKey(sourceMatrix);

// checkLayerRotations(1, sourceMatrix);




