/// <reference path="jquery.d.ts" />
var GameBoardId = "game-board";

var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();

        $("<canvas/>", {
            id: GameBoardId,
            html: "This should look like a game board"
        }).appendTo(this.element);
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () {
            return _this.span.innerHTML = new Date().toUTCString();
        }, 500);
    };

    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
})();

var Cell = (function () {
    function Cell(x, y) {
        this.x = x;
        this.y = y;
    }
    return Cell;
})();

var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["DOWN"] = 1] = "DOWN";
    Direction[Direction["LEFT"] = 2] = "LEFT";
    Direction[Direction["RIGHT"] = 3] = "RIGHT";
})(Direction || (Direction = {}));

var Snake = (function () {
    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
    }
    return Snake;
})();

var Game = (function () {
    function Game(panel, cellSize, lengthToWin, msPerMove, initialApple, snake) {
        this.panel = panel;
        this.cellSize = cellSize;
        this.lengthToWin = lengthToWin;
        this.msPerMove = msPerMove;
        this.initialApple = initialApple;
        this.snake = snake;
    }
    return Game;
})();

function boardDimentions(panel, cellSize) {
    return {
        width: Math.floor($(panel).width() / cellSize), height: Math.floor($(panel).height() / cellSize)
    };
}

function createCenterCell(width, heigth) {
    return new Cell(Math.floor(width / 2), Math.floor(heigth / 2));
}

function createRandomCell(width, height) {
    return new Cell(Math.floor((Math.random() * width)), Math.floor((Math.random() * height)));
}

function createSnake(width, height) {
    var head = createCenterCell(width, height);
    var body = [head];
    return new Snake(body, 3 /* RIGHT */);
}

function createGame(panel, cellSize) {
    var lengthToWin = 10;
    var msPerMove = 50;
    var dimentions = boardDimentions(panel, cellSize);
    var apple = createRandomCell(dimentions.width, dimentions.height);
    var snake = createSnake(dimentions.width, dimentions.height);
    return new Game(panel, cellSize, lengthToWin, msPerMove, apple, snake);
}

function paintCell(panel, color, cellSize, cell) {
    var canvas = document.getElementById(GameBoardId);

    if (!canvas.getContext) {
        return;
    }

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize);
}

window.onload = function () {
    var el = document.getElementById("content");
    var greeter = new Greeter(el);
    greeter.start();
};
//# sourceMappingURL=app.js.map
