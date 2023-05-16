import { defineComponent, PropType, UnwrapNestedRefs, DeepReadonly, reactive, readonly } from 'vue';
import { Cell, createCell, CellVue } from './Cell';
import { Food } from './js/food';
import { SmartSnake } from './js/smartSnake';
export type GroundState = {
    isActive: Boolean
}

export interface Ground {
    state: DeepReadonly<UnwrapNestedRefs<GroundState>>,
    row: number,
    colum: number,
    cells: Cell[][],
    snake: SmartSnake,
    food: Food,
    pause(): void,
    start(): void,
    restart(): void,
}

function fillGround(ground: Ground) {
    const cells = [] as Cell[][]
    const { row, colum } = ground
    for (let i = 0; i < row; i++) {
        cells.push([])
        for (let j = 0; j < colum; j++) {
            const cell = createCell({ x: j, y: i })
            cells[i].push(cell)
        }
    }
    ground.cells = cells
}

function createGround(): Ground {
    const state = reactive<GroundState>({
        isActive: false
    })
    const ground = {
        state: readonly(state),
        row: 10,
        colum: 10,
    } as Ground

    fillGround(ground)
    const snake = new SmartSnake(ground)
    const food = new Food(ground)
    food.generate()

    ground.food = food
    ground.snake = snake

    ground.pause = () => {
        if (!state.isActive) return
        state.isActive = false
        ground.snake.pause()
    }

    ground.start = () => {
        if (state.isActive) return
        state.isActive = true
        ground.snake.start()
    }

    ground.restart = () => {
        state.isActive = false
        ground.snake.reset()
        ground.food.generate()
    }

    return ground
}

export const ground = createGround()

export const GroundVue = defineComponent({
    setup() {
        onblur = () => ground.pause()
        const style = {
            display: 'grid',
            grid: `repeat(${ground.row}, 1fr) / repeat(${ground.colum}, 1fr)`,
            height: '600px',
            width: '600px',
        }
        return () =>
            <div class="ground" style={style}>
                {
                    ground.cells.map(row => {
                        return row.map(cell => <CellVue cell={cell} />)
                    })
                }
            </div>
    }
})