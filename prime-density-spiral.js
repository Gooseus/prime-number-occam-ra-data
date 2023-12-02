/******************************************************
 * Visualisation of prime density
 * 
 * Associated with this video:
 * http://www.khanacademy.org/cs/level-6-the-prime-number-theorem/1120046961
 * 
 * In every tick of the clock a number is added to the wheel
 * Each number, x, rotates about the central point at a
 * rate of 1/x times per tick.
 * 
 * Every time a number is added, a line is drawn from
 * the centre to the new number. The line crosses all 
 * factors. If no number is crossed then the number is
 * prime.
 * 
 * Controls
 * Spacebar: pause
 * Arrow keys: move up, down, left, right
 * Slider changes zoom
 *******************************************************/

// Variables for visuals
var scaling = 6;
var speed = 40; //Don't change whilst running
var minRadius = 16;
var arcColours = [color(235, 7, 193), color(4, 224, 8)];
var arcThickness = 2;
var labelFont = createFont("impact", 20);
var numberFont = createFont("times", 12);

// Timing
var findFactorTime = 16;
var running = true;

// Initial values
var wheels = 2;
var thetas = [0];
var colours = [0];
var mode = "find factors";
var factorLine = 0;
var label = "2. PRIME";
var gap = 0;

var currentScale = 1;
var maxScale = 1;
var translateX = 200;
var translateY = 200;

var findFactors = function(n) {
    var factors = [];
    for (var i = 2; i <= floor(n / 2); i++) {
        // Factors are numbers currently at zero degrees
        if (n % i === 0) {
            factors.push(i);
        }
    }
    return factors;
};

var addNumber = function() {
    // Rescale if getting too big
    if (scaling * wheels > 120) {
        // if currently at max scaling, current scale also changes
        if (currentScale + 0.1 > maxScale) {
            currentScale = scaling * wheels / 120;
        }
        maxScale = scaling * wheels / 120;
        strokeWeight(scaling * wheels / 40);
    }

    wheels++;
    var factors = findFactors(wheels);

    // Add new number    
    if (factors.length) {
        // Not prime
        colours.push(1);
        factorLine = 1.5 * scaling * (factors[0] - 1);
        label = wheels + ". Factors: " + factors.join(", ");
        gap++;
    } else {
        // Prime number
        factorLine = 0;
        colours.push(0);
        label = wheels + ". PRIME (" + gap + " since last prime)";
        gap = 0;
    }
    thetas.push(0); // New number starts at 0 degrees
};

var drawSlider = function(x, y) {
    var width = 100;
    strokeWeight(1);
    fill(240, 240, 250);

    textFont(numberFont, 164);
    textSize(16);
    text("Zoom: ", x, y);

    x += 50;
    rect(x, y, width, 3, 4);
    stroke(160, 160, 160);
    line(x + 1, y, x + width - 2, y);

    fill(180, 180, 180);
    stroke(50, 50, 50);
    var proportion = (currentScale - 0.5) / (maxScale - 0.5);
    var buttonX = x + width * (1 - proportion) - 5;

    rect(buttonX, y - 7, 10, 16, 3);
    line(buttonX + 3, y - 2, buttonX + 7, y - 2);
    line(buttonX + 3, y + 1, buttonX + 7, y + 1);
    line(buttonX + 3, y + 4, buttonX + 7, y + 4);

    // Handle mouse events
    if (mouseIsPressed) {
        // Drag slider for scale
        if (mouseX > x && mouseX < x + width &&
            mouseY > y - 7 && mouseY < y + 9) {
            proportion = (width + x - mouseX) / width;
            currentScale = 0.5 + proportion * (maxScale - 0.5);
        }
    }
};

var drawFindFactorLine = function() {
    stroke(arcColours[0]);
    var x1 = 1.5 * scaling * (wheels - 1) - 2;
    line(0, 0, x1, 0);

    // Line changes colour when a factor is found
    if (factorLine) {
        stroke(arcColours[1]);
        line(factorLine, 0, x1, 0);
    }
};

var timer = 0;
var draw = function() {
    var i;

    if (running) {
        timer++;

        // Calculate position of each number
        if (mode === "spinning") {
            for (i = 2; i <= wheels; i++) {
                thetas[i - 2] = (thetas[i - 2] + speed / i) % 360;
            }

            // Add number
            if (timer >= 360 / speed) {
                timer = 0;
                mode = "find factors";
                addNumber();
            }
        } else {
            // Timer for factor line
            if (timer >= findFactorTime) {
                mode = "spinning";
                timer = 0;
            }
        }
    }

    background(10, 10, 20);
    translate(translateX, translateY);
    scale(1 / currentScale, 1 / currentScale);
    strokeWeight(arcThickness * currentScale);

    if (mode === "find factors") {
        drawFindFactorLine();
    }

    // Draw arcs
    var theta1, theta2, radius;
    noFill();
    for (i = 2; i <= wheels; i++) {
        theta1 = thetas[i - 2] - 180 / i;
        theta2 = thetas[i - 2] + 180 / i;
        radius = 3 * scaling * (i - 2) + minRadius;

        stroke(arcColours[colours[i - 2]]);
        arc(0, 0, radius, radius, theta1, theta2);
    }

    // Write numbers for arcs
    fill(250, 250, 250);
    textFont(numberFont, 164);
    textSize(16);
    textAlign(CENTER, CENTER);

    for (i = 2; i <= wheels; i++) {
        radius = 1.5 * scaling * (i - 2) + minRadius + 5;
        theta1 = thetas[i - 2] + 90;
        text(i, radius * sin(theta1), -radius * cos(theta1));
    }

    // Draw centre
    noStroke();
    fill(240, 240, 240);
    ellipse(0, 0, 5, 5);

    // Write the current number and its factor
    resetMatrix();
    textAlign(LEFT, CENTER);
    fill(10, 10, 20, 220);
    rect(0, 0, 400, 70);
    fill(arcColours[colours[wheels - 2]]);
    textFont(labelFont, 24);
    textSize(24);
    text(label, 15, 25);

    drawSlider(15, 55);
};


var keyReleased = function() {
    //println(keyCode);

    if (keyCode === 32) {
        // Spacebar toogles pausing 
        if (running) {
            running = false;
        } else {
            running = true;
        }
    } else if (keyCode === UP) {
        translateY += 50;
    } else if (keyCode === DOWN) {
        translateY -= 50;
    } else if (keyCode === LEFT) {
        translateX += 50;
    } else if (keyCode === RIGHT) {
        translateX -= 50;
    }

};

// Let go when mouse leaves canvas
var mouseOut = function() {
    mouseIsPressed = false;
};
