var gridSize = 20;
var gridMargin = 1;
var gameCanvas = document.getElementById("game");
gameCanvas.width = 200;
gameCanvas.height = 200;
var ctx = gameCanvas.getContext('2d');

w = ~~(gameCanvas.width / gridSize);
h = ~~(gameCanvas.height / gridSize);

var grid = [];
for (let i=0; i<h; i++) {
	for (let j=0; j<w; j++) {
		grid.push([i, j]);
	}
}

var drawGrid = function (i, j, color) {
	ctx.fillStyle = color;
	ctx.fillRect(j*gridSize+gridMargin, i*gridSize+gridMargin, gridSize-2*gridMargin, gridSize-2*gridMargin);
}

grid.forEach(e => drawGrid(e[0], e[1], "black"));

var snake = [[~~(Math.random()*w), ~~(Math.random()*h)]];

var direction;
var newFood;

var foodAvailable = [];
for (let g of grid) {
	var flag = true;
	for (let s of snake) {
		if (s[0]===g[0] && s[1]===g[1]) {
			flag = false;
			break;
		}
	}
	if (flag) {
		foodAvailable.push(g);
	}
}
		
var checkBoudary = function(p) {
	return p[0]>=0 && p[0]<h && p[1]>=0 && p[1]<w;
}

var checkEatSelf = function(snake) {
	for (let i=1; i<snake.length; i++) {
		if (snake[0][0]==snake[i][0] && snake[0][1]==snake[i][1]) {
			return true;
		}
	}
	return false;
}

newFood = foodAvailable[~~(Math.random()*foodAvailable.length)];

var createBoard = function(snake) {
	var board = [];
	for (let i=0; i<h; i++) {
		board.push([]);
		for (let j=0; j<w; j++) {
			board[board.length-1].push(null);
		}
	}
	for (let s of snake.slice(1)) {
		board[s[0]][s[1]] = -1;
	}
	return board;
}

var createBoard2 = function(snake) {
	var board = [];
	for (let i=0; i<h; i++) {
		board.push([]);
		for (let j=0; j<w; j++) {
			board[board.length-1].push(null);
		}
	}
	for (let s of snake.slice(1, snake.length-1)) {
		board[s[0]][s[1]] = -1;
	}
	return board;
}

var getSafeMove = function(snake) {
	var move = [];
	var s = snake[0];
	if (snake.length === 2) {
		for (let p of [[s[0]-1, s[1]], [s[0]+1, s[1]], [s[0], s[1]-1], [s[0], s[1]+1]]) {
			if (checkBoudary(p) && !(p[0]===snake[1][0] && p[1]===snake[1][1])) {
				move.push(p);
			}
		}
		return move;
	}
	
	for (let p of [[s[0]-1, s[1]], [s[0]+1, s[1]], [s[0], s[1]-1], [s[0], s[1]+1]]) {
		for (let s of snake) {
			var tmp_snake = [];
			for (let s of snake) {
				tmp_snake.push(s);
			}
		}
		tmp_snake.unshift(p);
		tmp_snake.pop();
		if (checkBoudary(p) && !checkEatSelf(tmp_snake)) {
			move.push(p);
		}
	}
	return move;
}

var calc_dist = function(snake, food) {
	var p_1 = snake[0], p_2 = food;
	if (p_1[0]===p_2[0] && p_1[1]===p_2[1]) {
		return 0;
	}
	var board = createBoard(snake);
	var step = [[p_1]];
	board[p_1[0]][p_1[1]] = 0;
	while (true) {
		if (step[step.length-1].length === 0) {
			return Infinity;
		}
		step.push([]);
		for (let s of step[step.length-2]) {
			for (let e of [[s[0]-1, s[1]], [s[0]+1, s[1]], [s[0], s[1]-1], [s[0], s[1]+1]]) {
				if (checkBoudary(e) && board[e[0]][e[1]]===null) {
					step[step.length-1].push(e);
					board[e[0]][e[1]] = board[s[0]][s[1]] + 1;
					if (e[0]===p_2[0] && e[1]===p_2[1]) {
						return board[e[0]][e[1]];
					}
				}
			}
		}
	}
}

var calc_dist2 = function(snake) {
	if (snake.length === 1) {
		return 0;
	}
	
	var p_1 = snake[0], p_2 = snake[snake.length-1];
	var board = createBoard2(snake);
	
	var step = [[p_1]];
	board[p_1[0]][p_1[1]] = 0;
	while (true) {
		if (step[step.length-1].length === 0) {
			return Infinity;
		}
		step.push([]);
		for (let s of step[step.length-2]) {
			for (let e of [[s[0]-1, s[1]], [s[0]+1, s[1]], [s[0], s[1]-1], [s[0], s[1]+1]]) {
				if (checkBoudary(e) && board[e[0]][e[1]]===null) {
					step[step.length-1].push(e);
					board[e[0]][e[1]] = board[s[0]][s[1]] + 1;
					if (e[0]===p_2[0] && e[1]===p_2[1]) {
						return board[e[0]][e[1]];
					}
				}
			}
		}
	}
}

var follow_food = function(snake, food) {
	var pos = getSafeMove(snake);
	var dist = [];
	for (let p of pos) {
		var tmp_snake = [];
		for (let s of snake) {
			tmp_snake.push(s);
		}
		tmp_snake.unshift(p);
		if (!(p[0]===food[0] && p[1]===food[1])) {
			tmp_snake.pop();
		}
		dist.push(calc_dist(tmp_snake, food));
	}
	var best_i, tmp_dist = Infinity;
	for (let i=0; i<dist.length; i++) {
		if (dist[i] < tmp_dist) {
			tmp_dist = dist[i];
			best_i = i;
		}
	}
	if (best_i !== undefined) {
		return [true, pos[best_i]];
	} else {
		return [false];
	}
}

var follow_tail = function(snake, food) {
	var pos = getSafeMove(snake);
	var dist = [];
	for (let p of pos) {
		var tmp_snake = [];
		for (let s of snake) {
			tmp_snake.push(s);
		}
		tmp_snake.unshift(p);
		if (!food || !(p[0]===food[0] && p[1]===food[1])) {
			tmp_snake.pop();
		}
		dist.push(calc_dist2(tmp_snake));
	}
	var best_i, tmp_dist = -Infinity;
	for (let i=0; i<dist.length; i++) {
		if (dist[i]!==Infinity && dist[i]>tmp_dist) {
			tmp_dist = dist[i];
			best_i = i;
		}
	}
	if (best_i !== undefined) {
		return [true, pos[best_i]];
	} else {
		return [false, pos[~~(Math.random()*pos.length)]];
	}
}

var is_eat_safe = function(snake, food) {
	var virtual_snake = [];
	for (let s of snake) {
		virtual_snake.push(s);
	}
	while (true) {
		virtual_snake.unshift(follow_food(virtual_snake, food)[1]);
		if (!(virtual_snake[0][0]===food[0] && virtual_snake[0][1]===food[1])) {
			virtual_snake.pop();
		} else {
			if (virtual_snake.length === w*h) {
				return true;
			}
			return follow_tail(virtual_snake)[0];
		}
	}
}

var gameOver = function() {
	alert("Game Over!");
	clearInterval(timer);
}

var update = function() {
	if (foodAvailable.length === 0) {
		return gameOver();
	}
	
	if (getSafeMove(snake).length === 0) {
		return gameOver();
	}
	
	direction = follow_food(snake, newFood);
	if (direction[0] && is_eat_safe(snake, newFood)) {
		direction = direction[1];
	} else {
		if (!follow_tail(snake, newFood)[0]) {
			console.log("random walk");
		}
		direction = follow_tail(snake, newFood)[1];
	}
	snake.unshift(direction);
	/*
	var head = snake[0];
	if (head[0]===0 && head[1]===0) {
		direction = "right";
	} else if (head[0]%2===0 && head[1]===w-1) {
		direction = "down";
	} else if (head[0]%2===1 && head[1]===w-1) {
		direction = "left";
	} else if (head[0]%2===1 && head[1]===1) {
		if (head[0] === h-1) {
			direction = "left";
		} else {
			direction = "down";
		}
	} else if (head[0]%2===0 && head[1]===1) {
		direction = "right";
	} else if (head[0]===h-1 && head[1]===0) {
		direction = "up";
	}
	*/
	/*
	switch (direction) {
		case "left":
			snake.unshift([head[0], head[1]-1]);
			break;
		case "right":
			snake.unshift([head[0], head[1]+1]);
			break;
		case "up":
			snake.unshift([head[0]-1, head[1]]);
			break;
		case "down":
			snake.unshift([head[0]+1, head[1]]);
			break;
		default:
			snake.push([snake[snake.length-1]+1, snake[snake.length-1]]);
	}
	snake.direction = direction;
	*/
	
	head = snake[0];
	if (!checkBoudary(head)) {
		return gameOver();
	}
	if (head[0]===newFood[0] && head[1]===newFood[1]) {
		foodAvailable = [];
		for (let g of grid) {
			var flag = true;
			for (let s of snake) {
				if (s[0]===g[0] && s[1]===g[1]) {
					flag = false;
					break;
				}
			}
			if (flag) {
				foodAvailable.push(g);
			}
		}
		newFood = foodAvailable[~~(Math.random()*foodAvailable.length)];
	} else {
		var tail = snake.pop();
		if (checkEatSelf(snake)) {
			return gameOver();
		}
		drawGrid(tail[0], tail[1], "black");
	}
	/*
	drawGrid(head[0], head[1], "blue");
	if (snake[1]) {
		drawGrid(snake[1][0], snake[1][1], "green");
	} 
	if (snake.length > 1) {
		drawGrid(snake[snake.length-1][0], snake[snake.length-1][1], "yellow");
	}
	*/
	///*
	var colorArray = interpolateColors("rgb(0, 0, 255)", "rgb(0, 255, 0)", snake.length);
	for (let i=0; i<snake.length; i++) {
		drawGrid(snake[i][0], snake[i][1], colorArray[i]);
	}
	//*/
	if (newFood) {
		drawGrid(newFood[0], newFood[1], "red");
	}
}

// https://jsfiddle.net/002v98LL/
// Returns a single rgb color interpolation between given rgb color
// based on the factor given; via https://codepen.io/njmcode/pen/axoyD?editors=0010
function interpolateColor(color1, color2, factor) {
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};
// My function to interpolate between two colors completely, returning an array
function interpolateColors(color1, color2, steps) {
	color1 = color1.match(/\d+/g).map(Number);
	color2 = color2.match(/\d+/g).map(Number);
	if (steps === 1) {
		return [`rgb(${color1[0]}, ${color1[1]}, ${color1[2]})`];
	}

	var stepFactor = 1 / (steps - 1), interpolatedColorArray = [];

	for(var i = 0; i < steps; i++) {
		interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
	}

	var r = [];
	for (let i of interpolatedColorArray) {
		r.push(`rgb(${i[0]}, ${i[1]}, ${i[2]})`);
	}
	
	return r;
}

/*
window.onkeydown = () => {
	switch (event.keyCode) {
		case 37:
			if (snake.direction !== "right") {
				direction = "left";
			}
			break;
		case 38:
			if (snake.direction !== "down") {
				direction = "up";
			}
			break;
		case 39:
			if (snake.direction !== "left") {
				direction = "right";
			}
			break;
		case 40:
			if (snake.direction !== "up") {
				direction = "down";
			}
			break;
	}
}
*/

var timer = setInterval(update, 50);
