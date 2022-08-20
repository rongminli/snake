import { DeepReadonly, reactive, readonly, shallowReadonly, UnwrapNestedRefs } from 'vue'
import { Cell } from '../Cell'
import { Ground } from '../Ground'

export type FoodState = {
    currentCell: Cell | null
}
export interface Food {
    getCurrentCell(): Cell
    generate(): void
}
export function CreateFood(ground: Ground): Food {
    let currentCell : Cell

    function generate() {
        const x = Math.random() * 29 | 0
        const y = Math.random() * 29 | 0

        const randomCell = ground.cells[y][x]

        if(!randomCell.isSpace())  {
            generate()
        }else {
            randomCell.asFood()
            currentCell = randomCell
        }
    }

    const food = {
        getCurrentCell() {
            return currentCell
        },
        generate
    }

    function init() {
        food.generate()
    }

    init()

    return food
}
