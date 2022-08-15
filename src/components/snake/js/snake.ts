import { Food } from "./food"

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

class SnakeBody {
    cells = [] as any[]
    constructor(ground: any[]) {
        if (ground.length > 2) {
            this.push(ground[1])
            this.push(ground[0])
        } else {
            console.warn('ground not ready')
        }
    }
    push(cell: any) {
        cell.asSnakeBody()
        this.cells.push(cell)
    }
    shift(cell: any) {
        cell.asSnakeBody()
        this.cells.unshift(cell)
    }
    pop() {
        const snakeTail = this.cells.pop()
        snakeTail.asSpace()
    }
    move(to: any) {
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

    constructor(private ground: { cells: any[], food: Food }) {
        this.body = new SnakeBody(this.ground.cells)
        this.setKeyboardListener()
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

    private nextCell() {
        const head = this.body.head()
        let { x, y } = head.position
        x = x - 1
        y = y - 1
        let index = 0
        switch (this.direction) {
            case Direction.LEFT:
                if (x === 0) {
                    throw new Error('Out of bound')
                }
                index = (x - 1) + (y * 30)
                break
            case Direction.UP:
                if (y === 0) {
                    throw new Error('Out of bound')
                }
                index = x + (y - 1) * 30
                break
            case Direction.RIGHT:
                if (x === 29) {
                    throw new Error('Out of bound')
                }
                index = (x + 1) + (y * 30)
                break
            case Direction.DOWN:
                if (y === 29) {
                    throw new Error('Out of bound')
                }
                index = x + (y + 1) * 30
                break
        }
        return this.ground.cells[index]
    }

    move() {
        setTimeout(() => {
            let to
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
        this.body.shift(this.ground.food.cell)
        this.ground.food.generate()
    }
}