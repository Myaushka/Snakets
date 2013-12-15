/// <reference path="jquery.d.ts" />
var GameBoardId = "game-board";

var Cell = (function () {
    function Cell(x, y) {
        this.x = x;
        this.y = y;
    }
    return Cell;
})();

var Direction;
(function (Direction) {
    Direction[Direction["NONE"] = 0] = "NONE";
    Direction[Direction["UP"] = 1] = "UP";
    Direction[Direction["DOWN"] = 2] = "DOWN";
    Direction[Direction["LEFT"] = 3] = "LEFT";
    Direction[Direction["RIGHT"] = 4] = "RIGHT";
})(Direction || (Direction = {}));

var Snake = (function () {
    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
    }
    Object.defineProperty(Snake.prototype, "head", {
        get: function () {
            return this.body[0];
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Snake.prototype, "tail", {
        get: function () {
            return this.body[this.body.length - 1];
        },
        enumerable: true,
        configurable: true
    });
    return Snake;
})();

var Game = (function () {
    function Game(panel, cellSize, lengthToWin, msPerMove, apple, snake) {
        this.panel = panel;
        this.cellSize = cellSize;
        this.lengthToWin = lengthToWin;
        this.msPerMove = msPerMove;
        this.apple = apple;
        this.snake = snake;
    }
    return Game;
})();

// NOTE: all these functions that take the 1st parameter of Game or Panel should be instance methods.
function createCenterCell(dimensions) {
    return new Cell(Math.floor(dimensions.width / 2), Math.floor(dimensions.height / 2));
}

function createRandomCell(dimensions) {
    return new Cell(Math.floor((Math.random() * dimensions.width)), Math.floor((Math.random() * dimensions.height)));
}

function paintCell(panel, color, cellSize, cell) {
    if (!panel.getContext) {
        return;
    }

    var ctx = panel.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize);
}

// Static game
function boardDimensions(panel, cellSize) {
    return {
        width: Math.floor($(panel).width() / cellSize), height: Math.floor($(panel).height() / cellSize)
    };
}

// Static Game
function createSnake(dimensions) {
    var head = createCenterCell(dimensions);
    var body = [head];
    return new Snake(body, 4 /* RIGHT */);
}

// Game constuctor overload?
function createGame(panel, cellSize) {
    var lengthToWin = 10;
    var msPerMove = 50;
    var dimensions = boardDimensions(panel, cellSize);
    var apple = createRandomCell(dimensions);
    var snake = createSnake(dimensions);
    return new Game(panel, cellSize, lengthToWin, msPerMove, apple, snake);
}

// Instance game
function eraseCell(game, cell) {
    paintCell(game.panel, $(game.panel).css("background-color"), game.cellSize, cell);
}

// Instance game
function eraseApple(game) {
    eraseCell(game, game.apple);
}

// Instance game
function eraseSnake(game) {
    game.snake.body.forEach(function (cell) {
        eraseCell(game, cell);
    });
}

// Static game
function paintApple(panel, cellSize, apple) {
    paintCell(panel, "red", cellSize, apple);
}

function paintSnake(panel, cellSize, snake) {
    // We only need to paint the head because the rest will have been already painted.
    paintCell(panel, "green", cellSize, snake.head);
}

function paintGame(game) {
    paintApple(game.panel, game.cellSize, game.apple);
    paintSnake(game.panel, game.cellSize, game.snake);
}

function newApple(game) {
    eraseApple(game);
    return createRandomCell(boardDimensions(game.panel, game.cellSize));
}

var deltaVector = new Array();
deltaVector[3 /* LEFT */] = { dx: -1, dy: 0 };
deltaVector[4 /* RIGHT */] = { dx: 1, dy: 0 };
deltaVector[1 /* UP */] = { dx: 0, dy: -1 };
deltaVector[2 /* DOWN */] = { dx: 0, dy: 1 };

// Gets a vector containing dx and dy values for a given direction
function delta(direction) {
    return deltaVector[direction];
}

// Returns the snake's direction, which is either the current direction or a new one if a board edge was reached.
// NOTE: or this may indicate the end of the game. No?
function newDirection(game) {
    var snake = game.snake;
    var direction = snake.direction;
    var head = snake.head;
    var x = head.x;
    var y = head.y;

    // TODO: this is annoying. This should be cached in a game's property.
    var dimensions = boardDimensions(game.panel, game.cellSize);
    var atLeft = (x === 0);
    var atRight = (x === (dimensions.width - 1));
    var atTop = (y === 0);
    var atBottom = (y === (dimensions.height - 1));

    // Turn clockwise when a board edge is reached unless that would result in going off the board
    if (direction === 1 /* UP */ && atTop) {
        return atRight ? 3 /* LEFT */ : 4 /* RIGHT */;
    }

    if (direction === 4 /* RIGHT */ && atRight) {
        return atBottom ? 1 /* UP */ : 2 /* DOWN */;
    }

    if (direction === 2 /* DOWN */ && atBottom) {
        return atLeft ? 4 /* RIGHT */ : 3 /* LEFT */;
    }

    if (direction === 3 /* LEFT */ && atLeft) {
        return atTop ? 2 /* DOWN */ : 1 /* UP */;
    }

    return direction;
}

function isSameOrAdjacentCell(cell1, cell2) {
    var dx = Math.abs(cell1.x - cell2.x);
    var dy = Math.abs(cell2.y - cell2.y);

    return dx <= 1 && dy <= 1;
}

function shouldEatApple(game) {
    return isSameOrAdjacentCell(game.snake.head, game.apple);
}

function removeTail(game, body) {
    eraseCell(game, game.snake.tail);
    return body.slice(0, body.length - 1);
}

// Moves the snake and returns a new snake class. The snake grows by one cell if grow is true.
function moveSnake(game, grow) {
    var direction = newDirection(game);
    var d = delta(direction);
    var head = game.snake.head;
    var newHead = new Cell(head.x + d.dx, head.y + d.dy);
    var body = game.snake.body.concat([newHead], game.snake.body);
    if (!grow) {
        body = removeTail(game, body);
    }

    return new Snake(body, direction);
}

// Gets a direction that describes the direction associated with a given key code.
function getKeyDirection(keyCode) {
    switch (keyCode) {
        case 37:
            return 3 /* LEFT */;
        case 38:
            return 1 /* UP */;
        case 39:
            return 4 /* RIGHT */;
        case 40:
            return 2 /* DOWN */;
    }
    return 0 /* NONE */;
}

function isValidChange(keyDirection, currentDirection) {
    switch (keyDirection) {
        case 0 /* NONE */:
            return false;
        case 3 /* LEFT */:
            return currentDirection !== 4 /* RIGHT */;
        case 4 /* RIGHT */:
            return currentDirection !== 3 /* LEFT */;
        case 1 /* UP */:
            return currentDirection !== 2 /* DOWN */;
        case 2 /* DOWN */:
            return currentDirection !== 1 /* UP */;
    }

    return true;
}

var globalKeyCode;

function snakeWithKeyDirection(snake) {
    var keyDirection = getKeyDirection(globalKeyCode);
    var current = snake.direction;

    // Don't let the snake double back on itself.
    if (isValidChange(keyDirection, current)) {
        globalKeyCode = null;
        snake.direction = keyDirection;
    }

    return snake;
}

function doesHeadOverlapBody(body) {
    var head = body[0];
    for (var i = 1; i < body.length; i++) {
        if (head === body[i]) {
            return true;
        }
    }
    return false;
}

function restartGame(game) {
    eraseApple(game);
    eraseSnake(game);
    return createGame(game.panel, game.cellSize);
}

function newGame(game, message) {
    var panel = game.panel;
    //alert(message);
    //return restartGame(game);
}

function didWin(game) {
    return (game.snake.body.length === game.lengthToWin);
}

function didLose(game) {
    return doesHeadOverlapBody(game.snake.body);
}

function step(game) {
    var eat = shouldEatApple(game);
    var snake = snakeWithKeyDirection(game.snake);
    game.snake = snake;
    if (eat) {
        game.apple = newApple(game);
    }
    snake = moveSnake(game, eat);

    if (didLose(game)) {
        return newGame(game, "You killed the snake!");
    } else if (didWin) {
        return newGame(game, "You win!");
    } else {
        game.snake = snake;
    }

    return game;
}

function configurePanel(panel) {
    $(panel).attr("tabindex", "0").on("keydown", function (ev) {
        globalKeyCode = ev.keyCode;
        return false;
    });
}

var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();

        var gameBoard = document.getElementById(GameBoardId);

        var cellSize = 20;
        this.game = createGame(document.getElementById(GameBoardId), cellSize);
        paintGame(this.game);
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () {
            step(_this.game);
        }, 500);
    };

    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
})();

var greeter;

window.onload = function () {
    var el = document.getElementById("content");
    greeter = new Greeter(el);
    greeter.start();
};
//# sourceMappingURL=app.js.map
