import { DeepReadonly, reactive, UnwrapNestedRefs, readonly, toRaw, getCurrentInstance } from "vue"
import { Cell, Position } from "../Cell"
import { Ground } from "../Ground"
import { Food } from "./food"
import { CellPoint, createSnakePathAnalyst } from "./snakePathAnalysis"

enum Direction {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

type SnakeBodyState = {
    bodyCells: Cell[]
}

interface SnakeBody {
    restart(): void
    state: UnwrapNestedRefs<SnakeBodyState>,
    moveTo(cell: Cell): void,
    getHead(): Cell,
    eat(food: Food): void,
    reset(bodyCells: Cell[]): void
}

function CreateSnakeBody(ground: Ground): SnakeBody {
    const state = reactive<SnakeBodyState>({
        bodyCells: []
    })

    const unshift = (cell: Cell) => {
        cell.asSnakeBody()
        state.bodyCells.unshift(cell)
    }

    const pop = () => {
        const snakeTail = state.bodyCells.pop()
        snakeTail?.asSpace()
    }

    const push = (cell: Cell) => {
        cell.asSnakeBody()
        state.bodyCells.push(cell)
    }

    function init() {
        unshift(ground.cells[0][0])
        unshift(ground.cells[0][1])
    }



    init()

    function clear() {
        state.bodyCells.forEach(cell => cell.asSpace())
        state.bodyCells.length = 0
    }

    function load(bodyCells: Cell[]) {
        bodyCells.forEach(cell => push(cell))
    }

    return {
        state: state,
        moveTo(to: Cell) {
            unshift(to)
            pop()
        },
        getHead: () => state.bodyCells[0],
        eat(food) {
            const foodCell = food.getCurrentCell()
            if (foodCell != null) {
                foodCell.asSnakeBody()
                unshift(foodCell)
            }
        },
        restart() {
            clear()
            init()
        },
        reset(bodyCells: Cell[]) {
            clear()
            load(bodyCells)
        }
    }
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
        this.body = CreateSnakeBody(ground)

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
        let { x, y } = headCell.position
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
            if (to !== body.state.bodyCells[1]) {
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
type Point = {
    x: number, y: number, distance: number, parent: Point | null
}

export class SmartSnake extends Snake {
    pathAnalyst
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
        } else {
            this.auto()
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


