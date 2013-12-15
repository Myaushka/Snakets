/// <reference path="jquery.d.ts" />

var GameBoardId = "game-board";

class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
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

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

class Cell {
    constructor(public x: number, public y: number) {
    }
}

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

class Snake {
    constructor(public body: any, public direction: Direction) {
    }
}

class Game {
    constructor(
        public panel: HTMLElement,
        public cellSize: number,
        public lengthToWin: number,
        public msPerMove: number,
        public initialApple: Cell,
        public snake: Snake) {
    }
}

function boardDimentions(panel: HTMLElement, cellSize: number) {
    return {
        width: Math.floor($(panel).width() / cellSize), height: Math.floor($(panel).height() / cellSize)
    };
}

function createCenterCell(width: number, heigth: number) {
    return new Cell(Math.floor(width / 2), Math.floor(heigth / 2));
}

function createRandomCell(width: number, height: number) {
    return new Cell(Math.floor((Math.random() * width)), Math.floor((Math.random() * height)));
}

function createSnake(width: number, height: number) {
    var head = createCenterCell(width, height);
    var body = [head];
    return new Snake(body, Direction.RIGHT);
}

function createGame(panel: HTMLElement, cellSize: number) {
    var lengthToWin = 10;
    var msPerMove = 50;
    var dimentions = boardDimentions(panel, cellSize);
    var apple = createRandomCell(dimentions.width, dimentions.height);
    var snake = createSnake(dimentions.width, dimentions.height);
    return new Game(panel, cellSize, lengthToWin, msPerMove, apple, snake);
}

function paintCell(panel: HTMLElement, color: string, cellSize: number, cell: Cell) {
    var canvas = <HTMLCanvasElement> document.getElementById(GameBoardId);

    if (!canvas.getContext) {
        return;
    }

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize);
}

window.onload = () => {
    var el = document.getElementById("content");
    var greeter = new Greeter(el);
    greeter.start();
};