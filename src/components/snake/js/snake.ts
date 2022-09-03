import { reactive, UnwrapNestedRefs } from "vue"
import { Cell } from "../Cell"
import { Ground } from "../Ground"
import { SnakeBody } from "./snakeBody"
import { CellPoint, createSnakePathAnalyst } from "./snakePathAnalysis"

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

export type SnakeState = {
    speed: number,
    direction: Direction,
    isActive: boolean
}

export class Snake {
    private moveTimer!: number
    public state: UnwrapNestedRefs<SnakeState>
    public body: SnakeBody

    constructor(public ground: Ground) {
        this.state = reactive<SnakeState>({
            speed: 250,
            direction: Direction.RIGHT,
            isActive: false
        })
        this.body = new SnakeBody(ground)

        addEventListener('keydown', this.keydownHandler)
    }

    keydownHandler(event: KeyboardEvent) {
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
                break
        }
    }

    nextCell(): Cell {
        const { body, state: snakeState, ground } = this

        const headCell = body.getHead()
        let { x, y } = headCell.point
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
                if (x === 29) throw new Error('Out of bound')
                x++
                break
            case Direction.DOWN:
                if (y === 29) throw new Error('Out of bound')
                y++
                break
        }
        return ground.cells[y][x]
    }

    eat() {
        const { body, ground } = this
        body.eat(ground.food)
        ground.food.generate()
    }

    move() {
        let { body, state: snakeState, nextCell, eat } = this

        if (!snakeState.isActive) return

        let to: Cell
        try {
            to = nextCell()
        } catch (error) {
            alert(error)
            return
        }

        if (to.isFood()) {
            eat()
        } else if (to.isSnakeBody()) {
            if (to !== body.getState().cells[1]) {
                alert('You eat your self')
                return
            }
        } else {
            body.moveTo(to)
        }

    }

    pause() {
        this.state.isActive = false
    }

    start() {
        this.state.isActive = true
        this.move()
    }

    restart() {
        const { moveTimer, state, body } = this

        state.isActive = false
        moveTimer && clearTimeout(moveTimer)
        state.direction = Direction.RIGHT
        body.restart()
    }
}

export function CreateSnake(ground: Ground): Snake {
    return new Snake(ground)
}

type Path = Cell[]


export class SmartSnake extends Snake {
    private pathAnalyst
    constructor(ground: Ground) {
        super(ground)
        this.pathAnalyst = createSnakePathAnalyst(this.ground)
    }
    moveOnPath(path: Path) {
        const cell = path.shift() as Cell

        if (cell) {
            setTimeout(() => {
                if (cell.isFood()) {
                    this.eat()
                } else {
                    this.body.moveTo(cell)
                }
                this.moveOnPath(path)
            }, 50)
        }else {
            setTimeout(this.auto.bind(this),0)
        }

    }
    auto() {
        let path = this.pathAnalyst()

        if (path) {
            const pathCells = []
            while (path) {
                if (path.parent) {
                    const point = path.point as CellPoint
                    const cell = this.ground.cells[point.y][point.x]
                    pathCells.unshift(cell)
                }
                path = path.parent
            }
            this.moveOnPath(pathCells)
        }

    }
}

export function CreateSmartSnake(ground: Ground) {
    return new SmartSnake(ground)
}


