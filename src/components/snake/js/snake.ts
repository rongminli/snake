import { DeepReadonly, reactive, UnwrapNestedRefs, readonly } from "vue"
import { Cell } from "../Cell"
import { Ground } from "../Ground"
import { Food } from "./food"

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
    state: DeepReadonly<UnwrapNestedRefs<SnakeBodyState>>,
    moveTo(cell: Cell): void,
    getHead(): Cell,
    eat(food: Food): void
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

    function init() {
        unshift(ground.cells[0][0])
        unshift(ground.cells[0][1])
    }

    init()

    return {
        state: readonly(state),
        moveTo(to: Cell) {
            unshift(to)
            pop()
        },
        getHead: () => state.bodyCells[0],
        eat(food){
            const foodCell = food.getCurrentCell()
            if(foodCell != null)  {
                foodCell.asSnakeBody()
                unshift(foodCell)
            }
        }
    }
}

export type SnakeState = {
    speed: number,
    direction: Direction,
    isActive: boolean
}

export interface Snake {
    state: DeepReadonly<UnwrapNestedRefs<SnakeState>>,
    body: SnakeBody,
    pause(): void,
    start(): void
}
export function CreateSnake(ground: Ground): Snake {

    const snakeState = reactive<SnakeState> ({
        speed: 250,
        direction: Direction.RIGHT,
        isActive: false
    })

    const body =  CreateSnakeBody(ground)


    function keydownHandler(event: KeyboardEvent) {
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

    function setKeyboardListener() {
        window.addEventListener('keydown', keydownHandler)
    }

    function nextCell(): Cell {
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

    function eat() {
        body.eat(ground.food) 
        ground.food.generate()
    }

    function move() {
        if(!snakeState.isActive) return
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

        setTimeout(move, snakeState.speed)
    }

    const snake = {
        state: readonly(snakeState),
        body,
        pause: () => snakeState.isActive = false,
        start: () => {
            snakeState.isActive = true
            move()
        }
    }

    function init() {
        setKeyboardListener()
    }

    init()

    return snake
}

