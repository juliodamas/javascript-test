var coordinates = [];
var pre = {}, act = {};
var url = 'https://warm-thicket-98293.herokuapp.com/';

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    var canvas = document.getElementById("canvas");
    canvas.addEventListener("mousedown", getPosition, false);
}

function getPosition(event) {
    var x = new Number();
    var y = new Number();
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;

    if (event.x != undefined && event.y != undefined)
    {
        x = event.x;
        y = event.y;
    }
    else // Firefox method to get the position
    {
        x = event.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    coordinates.push({ x: x, y: y, toString: function() { return '('+this.x + ',' + this.y +')'}});
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2, true);
    ctx.fill();
}

function resizeCanvas() {
    var canvas = $("#canvas");
    if (canvas) 
        canvas.attr("width", canvas.parent().width());
}

function refreshCanvas() {
    coordinates = [];
    $('#response').val('');
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function identifyShape() {
    $('#response').val('');
    var clength = coordinates.length;
    switch(clength) {
        case 3: 
            validateTriangule();
            break;
        case 4:
            validateSquare();
            break;
        default:
            randomShape();
    }
}

function validateSquare() {
    if (coordinates.length == 4) {
        var a = coordinates[0];
        var b = coordinates[1];
        var c = coordinates[2];
        var d = coordinates[3];
        var la = getDistance(a, b);
        var lb = getDistance(b, c);
        var lc = getDistance(c, d);
        var ld = getDistance(d, a);
        var ad = (getAngle(b, d, a) * (180 / Math.PI));
        var bc = (getAngle(d, b, c) * (180 / Math.PI));
        var area = ((0.5 * (la * ld)) * Math.sin(ad)) + ((0.5 * (lb * lc)) * Math.sin(bc));
        swal("Square", "Squared thoughts: " + (parseInt(area)), "success");
        var points = '[' + coordinates.join(',') + ']';
        getResponse(true, parseInt(area), points);
    }
}

function validateTriangule() {
    if (coordinates.length == 3) {
        var a = coordinates[0];
        var b = coordinates[1];
        var c = coordinates[2];
        var la = getDistance(a, b);
        var lb = getDistance(b, c);
        var lc = getDistance(c, a);
        var s = (0.5 * (la+lb+lc));
        var area = Math.sqrt((s * (s - la)) * (s - lb) * (s - lc));
        var isosceles = ((b.x == c.x || b.y == c.y) || (a.x == b.x || a.y == b.y) || (c.x == a.x || c.y == a.y));
        swal("Triangle", isosceles? "Isosceles!" : "Just another triangle", isosceles?"success":"warning");
        var points = '[' + coordinates.join(',') + ']';
        getResponse(false, parseInt(area), points, isosceles ? "isosceles" : "other");
    }
}

function randomShape() {
    var first = coordinates[0];
    var last = coordinates[coordinates.length - 1];
    var dist = getDistance(first, last);
    swal("Distance", "Distance from the first click until the last one: " + parseInt(dist), "success");
}

function getDistance(a, b) {
    return Math.sqrt( Math.pow((a.x-b.x), 2) + Math.pow((a.y-b.y), 2));
}

function getAngle(p0, p1, c) {
    var p0c = Math.sqrt(Math.pow(c.x-p0.x,2)+
                        Math.pow(c.y-p0.y,2)); // p0->c (b)   
    var p1c = Math.sqrt(Math.pow(c.x-p1.x,2)+
                        Math.pow(c.y-p1.y,2)); // p1->c (a)
    var p0p1 = Math.sqrt(Math.pow(p1.x-p0.x,2)+
                         Math.pow(p1.y-p0.y,2)); // p0->p1 (c)
    return Math.acos((p1c*p1c+p0c*p0c-p0p1*p0p1)/(2*p1c*p0c));
}

function getResponse(isSquare, area, points, type) {
    points = window.btoa(points);
    var restUrl = url + (isSquare ? 'square?area=' + area : 'triangle?area='+area+'&type=' + type + '') +'&points=' + points;
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", restUrl, true);
    xhttp.addEventListener("load", function() {
         $('#response').val(xhttp.responseText);
    });
    xhttp.addEventListener("error", function() {
        swal("Error", "Network error", "error");
    });
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(null);
}

window.onload = function() {
    resizeCanvas();
};
