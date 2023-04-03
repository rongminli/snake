import { message } from "ant-design-vue"
import { reactive, UnwrapNestedRefs, watchEffect } from "vue"
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
    public moveTimer: NodeJS.Timer | null = null
    public state: UnwrapNestedRefs<SnakeState>
    public body: SnakeBody

    constructor(public ground: Ground) {
        this.state = reactive<SnakeState>({
            speed: 250,
            direction: Direction.RIGHT,
        })
        this.body = new SnakeBody(ground)

        addEventListener('keydown', event => this.keydownHandler(event))
        watchEffect(() => this.state.speed,)
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

    private nextCell(): Cell | void {
        const { body, state: snakeState, ground } = this

        const headCell = body.getHead()
        let { x, y } = headCell.coord

        const maxX = this.ground.cells.length
        const maxY = this.ground.cells[0].length

        switch (snakeState.direction) {
            case Direction.LEFT:
                if (x === 0) return this.outRange()
                break
            case Direction.UP:
                if (y === 0) return this.outRange()
                y--
                break
            case Direction.RIGHT:
                if (x === maxX - 1) return this.outRange()
                x++
                break
            case Direction.DOWN:
                if (y === maxY - 1) return this.outRange()
                y++
                break
        }
        return ground.cells[y][x]
    }

    private outRange() {
        this.pause()
        message.error('out range', 1.5)
    }

    protected eat() {
        const { body, ground } = this
        body.eat(ground.food)
    }

    private step() {
        const to = this.nextCell()
        if (!to) {
            return
        }

        if (to.isFood()) {
            this.eat()
        } else if (to.isSnakeBody()) {
            this.pause()
            message.error('You eat your self', 1.5);
            return
        } else {
            this.body.moveTo(to)
        }
    }

    pause() {
        this.moveTimer
            ? clearTimeout(this.moveTimer)
            : this.moveTimer = null
    }

    move() {
        this.moveTimer = setTimeout(
            this.move.bind(this),
            this.state.speed
        )
        this.step()
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







