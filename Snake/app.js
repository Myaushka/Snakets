/// <reference path="jquery.d.ts" />
var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();

        $("<div/>", {
            id: "game-board"
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

window.onload = function () {
    var foo = new Cell(1, 1);

    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};
//# sourceMappingURL=app.js.map
