import { reactive, shallowReadonly, UnwrapNestedRefs } from "vue";
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

export class SnakeBody {
    public cells: Cell[]
    constructor(private ground: Ground) {
        this.cells = []
        this.unshift(ground.cells[0][0])
        this.unshift(ground.cells[0][1])
    }
    private unshift(cell: Cell){
        cell.asSnakeBody()
        this.cells.unshift(cell)
    }

    private pop(){
        const snakeTail = this.cells.pop()
        snakeTail?.asSpace()
    }

    private clear() {
        const cells = this.cells
        cells.forEach(cell => cell.asSpace())
        cells.length = 0
    }

    moveTo(to: Cell) {
        const cells = this.cells
        cells[cells.length-2].asTail()
        cells[0].asSnakeBody()
        this.pop()
        this.unshift(to)
        to.asHead()
    }

    getHead(): Cell {
        return this.cells[0] as Cell
    }

    eat(food: Food) {
        food.eat(this)
    }

    reset() {
        this.clear()
        this.unshift(this.ground.cells[0][0])
        this.unshift(this.ground.cells[0][1])
    }
}