import { defineComponent, PropType, UnwrapNestedRefs, DeepReadonly, reactive, readonly } from 'vue';
import { Cell, createCell, CellVue } from './Cell';
import { CreateFood, Food } from './js/food';
import { CreateSmartSnake, CreateSnake, SmartSnake, Snake } from './js/snake';

export type GroundState = {
    isActive: Boolean
}

export interface Ground {
    state: DeepReadonly<UnwrapNestedRefs<GroundState>>,
    row: number,
    colum: number,
    cells: Cell[][],
    snake: Snake | SmartSnake,
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

export function createGround(): Ground {
    const state = reactive<GroundState>({
        isActive: false
    })
    const ground = {
        state: readonly(state),
        row: 10,
        colum: 10,
    } as Ground

    fillGround(ground)
    const snake = CreateSmartSnake(ground)
    const food = CreateFood(ground)

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
        ground.snake.restart()
        ground.food.reset()
    }

    return ground
}

export const GroundVue = defineComponent({
    props: {
        ground: {
            type: Object as PropType<Ground>,
            required: true
        }
    },
    setup({ ground }) {
        const style = {
            display: 'grid',
            grid: `repeat(${ground.row}, 1fr) / repeat(${ground.colum}, 1fr)`,
            border: '1px solid #ddd',
            height: '600px',
            width: '600px',
        }

        return () =>
            <div class="ground" style={style}>
                {
                    ground.cells.map(row => {
                        return row.map(cell => {
                            return <CellVue cell={cell} />
                        })
                    })
                }
            </div>
    }
})