/// <reference path="jquery.d.ts" />

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

        $("<div/>", {
            id: "game-board"
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

class Snake {
    constructor(public body: any, public direction: any) {
    }
}

class Game {
    constructor(
        public panel: HTMLElement,
        public cellSize: { height: number; width: number },
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

window.onload = () => {
    var foo = new Cell(1, 1);

    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};