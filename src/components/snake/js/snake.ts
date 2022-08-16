import { Cell } from "../Cell"
import { Ground } from "../Ground"

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

class SnakeBody {
    cells = [] as Cell[]
    constructor(ground: Ground) {
        this.push(ground.cells[0][1])
        this.push(ground.cells[0][0])
    }
    push(cell: Cell) {
        cell.asSnakeBody()
        this.cells.push(cell)
        console.log(this.cells)
    }
    shift(cell: Cell) {
        cell.asSnakeBody()
        this.cells.unshift(cell)
    }
    pop() {
        const snakeTail = this.cells.pop()
        snakeTail?.asSpace()
    }
    move(to: Cell) {
        this.shift(to)
        this.pop()
    }
    head() {
        return this.cells[0]
    }
}

export class Snake {
    speed = 250
    body: SnakeBody
    direction = Direction.RIGHT

    constructor(private ground: Ground) {
        this.body = new SnakeBody(this.ground)
        this.setKeyboardListener()
        ground.snake = this
    }

    private setKeyboardListener() {
        window.addEventListener('keydown', this.keydownHandler.bind(this))
    }

    keydownHandler(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
                if (this.direction === Direction.DOWN) break
                this.direction = Direction.UP
                break
            case 'ArrowDown':
                if (this.direction === Direction.UP) break
                this.direction = Direction.DOWN
                break
            case 'ArrowRight':
                if (this.direction === Direction.LEFT) break
                this.direction = Direction.RIGHT
                break
            case 'ArrowLeft':
                if (this.direction === Direction.RIGHT) break
                this.direction = Direction.LEFT
                break
        }
    }

    private nextCell(): Cell {
        const head = this.body.head()
        let { x, y } = head.position
        let index = 0
        switch (this.direction) {
            case Direction.LEFT:
                if (x === 0) {
                    throw new Error('Out of bound')
                }
                x--
                break
            case Direction.UP:
                if (y === 0) {
                    throw new Error('Out of bound')
                }
                y--
                break
            case Direction.RIGHT:
                if (x === 29) {
                    throw new Error('Out of bound')
                }
                x++
                break
            case Direction.DOWN:
                if (y === 29) {
                    throw new Error('Out of bound')
                }
                y++
                break
        }
        return this.ground.cells[y][x]
    }

    move() {
        setTimeout(() => {
            let to: Cell
            try {
                to = this.nextCell()
            } catch (error) {
                alert(error)
                return
            }

            if (to.isFood()) {
                this.eat()
            } else if (to.isSnakeBody()) {
                if (to !== this.body.cells[1]) {
                    alert('You eat your self')
                    return
                }
            } else {
                this.body.move(to)
            }

            this.move()
        }, this.speed)
    }
    eat() {
        if(this.ground.food.cell != null){
            this.body.shift(this.ground.food.cell)
            this.ground.food?.generate()
        }
    }
}