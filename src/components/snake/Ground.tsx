import { onMounted, defineComponent, PropType } from 'vue';
import { Cell, createCell, CellVue } from './Cell';
import { Food } from './js/food';
import { Snake } from './js/snake';

export const row = 30;
export const colum = 30;

export interface Ground {
    row: number,
    colum: number,
    cells: Cell[][],
    snake: Snake,
    food: Food
}

function getCells(): Cell[][] {
    const cells = [] as Cell[][] 
    for (let i = 0; i < row; i++) {
        cells.push([])
        for (let j = 0; j < colum; j++) {
            const cell = createCell({ x: j, y: i })
            cells[i].push(cell)
        }
    }
    return cells
}

export function createGround(): Ground {
    const ground = {} as Ground
    ground.cells = getCells()
    new Food(ground)
    new Snake(ground)

    return ground
}

export const GroundVue = defineComponent({
    props: {
        ground: {
            type: Object as PropType<Ground>,
            required: true
        }
    },
    setup(props) {
        const style = {
            display: 'grid',
            grid: `repeat(${row}, 1fr) / repeat(${colum}, 1fr)`,
            border: '1px solid #ddd',
            height: '600px',
            width: '600px',
        }

        const { ground } = props

        onMounted(() => {
            ground.snake?.move()
            console.log(ground)
        })

        return () =>
            <div class="ground" style={style}>
                {ground.cells.map(row => {
                    return row.map(cell => <CellVue cell={cell} />)
                })}
            </div>
    }
})