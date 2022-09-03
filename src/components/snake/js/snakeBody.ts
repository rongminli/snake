import { DeepReadonly, reactive, readonly, shallowReadonly, UnwrapNestedRefs } from "vue";
import { Cell } from "../Cell";
import { Ground } from "../Ground";
import { Food } from "./food";



export class StateFullObject<T extends object> {
    readonly state
    constructor(state: T) {
        this.state = reactive(state)
    }
    getState() : Readonly<UnwrapNestedRefs<T>> {
        return shallowReadonly(this.state)
    }
}

export type SnakeBodyState = {
    cells: Cell[]
}

export class SnakeBody extends StateFullObject<SnakeBodyState> {
    constructor(private ground: Ground) {
        super({
            cells: []
        })
        this.unshift(ground.cells[0][0])
        this.unshift(ground.cells[0][1])
    }
    private unshift(cell: Cell){
        cell.asSnakeBody()
        this.state.cells.unshift(cell)
    }

    private pop(){
        const snakeTail = this.state.cells.pop()
        snakeTail?.asSpace()
    }

    private clear() {
        const cells = this.state.cells
        cells.forEach(cell => cell.asSpace())
        cells.length = 0
    }

    moveTo(to: Cell) {
        this.pop()
        this.unshift(to)
    }

    getHead(): Cell {
        return this.state.cells[0] as Cell
    }

    eat(food: Food) {
        const foodCell = food.getCurrentCell()
        if (foodCell != null) {
            this.unshift(foodCell)
        }
    }

    restart() {
        this.clear()
        this.unshift(this.ground.cells[0][0])
        this.unshift(this.ground.cells[0][1])
    }
}