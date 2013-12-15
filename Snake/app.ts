/// <reference path="jquery.d.ts" />

var GameBoardId = "game-board";

class Cell {
    constructor(public x: number, public y: number) {
    }
}

enum Direction {
    NONE,
    UP,
    DOWN,
    LEFT,
    RIGHT
}

class Snake {
    constructor(public body: Cell[], public direction: Direction) {
    }

    get head(): Cell {
        return this.body[0];
    }

    get tail(): Cell {
        return this.body[this.body.length - 1];
    }
}

class Game {
    constructor(
        public panel: HTMLCanvasElement,
        public cellSize: number,
        public lengthToWin: number,
        public msPerMove: number,
        public apple: Cell,
        public snake: Snake) {
    }
}

// NOTE: all these functions that take the 1st parameter of Game or Panel should be instance methods.

function createCenterCell(dimensions: { width: number; height: number }) {
    return new Cell(Math.floor(dimensions.width / 2), Math.floor(dimensions.height / 2));
}

function createRandomCell(dimensions: { width: number; height: number }) {
    return new Cell(Math.floor((Math.random() * dimensions.width)), Math.floor((Math.random() * dimensions.height)));
}

function paintCell(panel: HTMLCanvasElement, color: string, cellSize: number, cell: Cell) {
    if (!panel.getContext) {
        return;
    }

    var ctx = panel.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize);
}

// Static game
function boardDimensions(panel: HTMLElement, cellSize: number) {
    return {
        width: Math.floor($(panel).width() / cellSize), height: Math.floor($(panel).height() / cellSize)
    };
}

// Static Game
function createSnake(dimensions: { width: number; height: number }) {
    var head = createCenterCell(dimensions);
    var body = [head];
    return new Snake(body, Direction.RIGHT);
}

// Game constuctor overload?
function createGame(panel: HTMLCanvasElement, cellSize: number) {
    var lengthToWin = 10;
    var msPerMove = 50;
    var dimensions = boardDimensions(panel, cellSize);
    var apple = createRandomCell(dimensions);
    var snake = createSnake(dimensions);
    return new Game(panel, cellSize, lengthToWin, msPerMove, apple, snake);
}

// Instance game
function eraseCell(game: Game, cell: Cell) {
    paintCell(game.panel, $(game.panel).css("background-color"), game.cellSize, cell);
}

// Instance game
function eraseApple(game: Game) {
    eraseCell(game, game.apple);
}

// Instance game
function eraseSnake(game: Game) {
    game.snake.body.forEach(function (cell: Cell) {
        eraseCell(game, cell);
    });
}

// Static game
function paintApple(panel: HTMLCanvasElement, cellSize: number, apple: Cell) {
    paintCell(panel, "red", cellSize, apple);
}

function paintSnake(panel: HTMLCanvasElement, cellSize: number, snake: Snake) {
    // We only need to paint the head because the rest will have been already painted.
    paintCell(panel, "green", cellSize, snake.head);
}

function paintGame(game: Game) {
    paintApple(game.panel, game.cellSize, game.apple);
    paintSnake(game.panel, game.cellSize, game.snake);
}

function newApple(game: Game) {
    eraseApple(game);
    return createRandomCell(boardDimensions(game.panel, game.cellSize));
}

var deltaVector = new Array();
deltaVector[Direction.LEFT] = { dx: -1, dy: 0 };
deltaVector[Direction.RIGHT] = { dx: 1, dy: 0 };
deltaVector[Direction.UP] = { dx: 0, dy: -1 };
deltaVector[Direction.DOWN] = { dx: 0, dy: 1 };

// Gets a vector containing dx and dy values for a given direction
function delta(direction: Direction): { dx: number; dy: number } {
    return deltaVector[direction];
}

// Returns the snake's direction, which is either the current direction or a new one if a board edge was reached.
// NOTE: or this may indicate the end of the game. No?
function newDirection(game: Game) {
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
    if (direction === Direction.UP && atTop) {
        return atRight ? Direction.LEFT : Direction.RIGHT;
    }

    if (direction === Direction.RIGHT && atRight) {
        return atBottom ? Direction.UP : Direction.DOWN;
    }

    if (direction === Direction.DOWN && atBottom) {
        return atLeft ? Direction.RIGHT : Direction.LEFT;
    }

    if (direction === Direction.LEFT && atLeft) {
        return atTop ? Direction.DOWN : Direction.UP;
    }

    return direction;
}

function isSameOrAdjacentCell(cell1: Cell, cell2: Cell) {
    var dx = Math.abs(cell1.x - cell2.x);
    var dy = Math.abs(cell2.y - cell2.y);

    return dx <= 1 && dy <= 1;
}

function shouldEatApple(game: Game) {
    return isSameOrAdjacentCell(game.snake.head, game.apple);
}

function removeTail(game: Game, body: Cell[]) {
    eraseCell(game, game.snake.tail);
    return body.slice(0, body.length - 1);
}

// Moves the snake and returns a new snake class. The snake grows by one cell if grow is true.
function moveSnake(game: Game, grow: boolean) {
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
function getKeyDirection(keyCode: number): Direction {
    switch (keyCode) {
        case 37: return Direction.LEFT;
        case 38: return Direction.UP;
        case 39: return Direction.RIGHT;
        case 40: return Direction.DOWN;
    }
    return Direction.NONE;
}

function isValidChange(keyDirection: Direction, currentDirection: Direction): boolean {
    switch (keyDirection) {
        case Direction.NONE: return false;
        case Direction.LEFT: return currentDirection !== Direction.RIGHT;
        case Direction.RIGHT: return currentDirection !== Direction.LEFT;
        case Direction.UP: return currentDirection !== Direction.DOWN;
        case Direction.DOWN: return currentDirection !== Direction.UP;
    }

    return true;
}

var globalKeyCode: number;

function snakeWithKeyDirection(snake: Snake) : Snake {
    var keyDirection = getKeyDirection(globalKeyCode);
    var current = snake.direction;

    // Don't let the snake double back on itself.
    if (isValidChange(keyDirection, current)) {
        globalKeyCode = null;
        snake.direction = keyDirection;
    }

    return snake;
}

function doesHeadOverlapBody(body: Cell[]) : boolean {
    var head = body[0];
    for (var i = 1; i < body.length; i++) {
        if (head === body[i]) {
            return true;
        }
    }
    return false;
}

function restartGame(game: Game) : Game {
    eraseApple(game);
    eraseSnake(game);
    return createGame(game.panel, game.cellSize);
}

function newGame(game: Game, message: string): Game {
    var panel = game.panel;
    //alert(message);
    //return restartGame(game);
}

function didWin(game: Game): boolean {
    return (game.snake.body.length === game.lengthToWin);
}

function didLose(game: Game): boolean {
    return doesHeadOverlapBody(game.snake.body);
}

function step(game: Game) : Game {
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

function configurePanel(panel: HTMLCanvasElement) {
    $(panel)
        .attr("tabindex", "0")
        .on("keydown", function (ev: KeyboardEvent) {
            globalKeyCode = ev.keyCode;
            return false;
        });
}

class Greeter {
    span: HTMLElement;
    timerToken: number;
    game: Game;

    constructor(public element: HTMLElement) {
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();

        var gameBoard = document.getElementById(GameBoardId);

        var cellSize = 20;
        this.game = createGame(<HTMLCanvasElement>document.getElementById(GameBoardId), cellSize);
        paintGame(this.game);
    }

    start() {
        this.timerToken = setInterval(() => {
            step(this.game);
        }, 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }
}

var greeter;

window.onload = () => {
    var el = document.getElementById("content");
    greeter = new Greeter(el);
    greeter.start();
};