import { DeepReadonly, reactive, readonly, shallowReadonly, UnwrapNestedRefs } from 'vue'
import { Cell } from '../Cell'
import { Ground } from '../Ground'

export type FoodState = {
    currentCell: Cell | null
}
export interface Food {
    reset()
    getCurrentCell(): Cell
    generate(): void
}
export function CreateFood(ground: Ground): Food {
    let currentCell: Cell

    function generate() {
        const spaceCell = [] as Cell[]
        ground.cells.forEach(cells => cells.forEach(cell => {
            if (!cell.isSnakeBody()) {
                spaceCell.push(cell)
            }
        }))
        const index = Math.random() * spaceCell.length - 1 | 0
        const randomCell = spaceCell[index]
        randomCell.asFood()
        currentCell = randomCell
    }

    const food = {
        getCurrentCell() {
            return currentCell
        },
        generate,
        reset() {
            currentCell.asSpace()
            generate()
        }
    }

    function init() {
        food.generate()
    }

    init()

    return food
}
