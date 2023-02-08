import { reactive, UnwrapNestedRefs } from "vue"
import { Cell } from "../Cell"
import { Ground } from "../Ground"
import { SnakeBody } from "./snakeBody"

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

export type SnakeState = {
    speed: number,
    direction: Direction,
}

export class Snake {
    private moveTimer!: number
    public state: UnwrapNestedRefs<SnakeState>
    public body: SnakeBody

    constructor(public ground: Ground) {
        this.state = reactive<SnakeState>({
            speed: 250,
            direction: Direction.RIGHT,
        })
        this.body = new SnakeBody(ground)

        addEventListener('keydown', event => this.keydownHandler(event))
    }

    private keydownHandler(event: KeyboardEvent) {
        const snakeState = this.state
        switch (event.code) {
            case 'ArrowUp':
                if (snakeState.direction === Direction.DOWN) break
                snakeState.direction = Direction.UP
                break
            case 'ArrowDown':
                if (snakeState.direction === Direction.UP) break
                snakeState.direction = Direction.DOWN
                break
            case 'ArrowRight':
                if (snakeState.direction === Direction.LEFT) break
                snakeState.direction = Direction.RIGHT
                break
            case 'ArrowLeft':
                if (snakeState.direction === Direction.RIGHT) break
                snakeState.direction = Direction.LEFT
        }
    }

    private nextCell(): Cell {
        const { body, state: snakeState, ground } = this

        const headCell = body.getHead()
        let { x, y } = headCell.coord

        const maxX = this.ground.cells.length
        const maxY = this.ground.cells[0].length

        switch (snakeState.direction) {
            case Direction.LEFT:
                if (x === 0) throw new Error('Out of bound')
                x--
                break
            case Direction.UP:
                if (y === 0) throw new Error('Out of bound')
                y--
                break
            case Direction.RIGHT:
                if (x === maxX - 1) throw new Error('Out of bound')
                x++
                break
            case Direction.DOWN:
                if (y === maxY - 1) throw new Error('Out of bound')
                y++
                break
        }
        return ground.cells[y][x]
    }

    protected eat() {
        const { body, ground } = this
        body.eat(ground.food)
    }

    private step() {
        let to: Cell

        try {
            to = this.nextCell()
        } catch (error) {
            this.pause()
            alert(error)
            return
        }

        if (to.isFood()) {
            this.eat()
        } else if (to.isSnakeBody()) {
            alert('You eat your self')
            return
        } else {
            this.body.moveTo(to)
        }
    }

    pause() {
        clearTimeout(this.moveTimer)
        this.moveTimer = 0
    }

    move() {
        if (this.moveTimer) {
            return
        }

        const speed = this.state.speed || 500
        this.moveTimer = setInterval(
            () => this.step(),
            speed
        )
    }

    start() {
        this.move()
    }

    reset() {
        const { moveTimer, state, body } = this

        moveTimer && clearTimeout(moveTimer)
        state.direction = Direction.RIGHT
        body.reset()
    }
}







