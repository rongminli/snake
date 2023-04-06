import { reactive, shallowReadonly, UnwrapNestedRefs } from "vue";
import { Cell } from "../Cell";
import { Ground } from "../Ground";
import { Food } from "./food";

export class StateFullObject<T extends object> {
    readonly state
    constructor(state: T) {
        this.state = reactive(state)
    }
    getState(): Readonly<UnwrapNestedRefs<T>> {
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
        ground.cells[0][0].asTail()
        ground.cells[0][1].asSnakeBody()
        ground.cells[0][2].asHead()
        this.cells.unshift(ground.cells[0][0])
        this.cells.unshift(ground.cells[0][1])
        this.cells.unshift(ground.cells[0][2])
    }

    private clear() {
        const cells = this.cells
        cells.forEach(cell => cell.asSpace())
        cells.length = 0
    }

    moveTo(to: Cell) {
        const cells = this.cells
        const lastTail = cells.pop()?.asSpace()
        cells[cells.length - 1].asTail()
        cells[0].asSnakeBody()
        to.asHead()
        cells.unshift(to)
    }

    getHead(): Cell {
        return this.cells[0] as Cell
    }

    eat(food: Food) {
        food.eat(this)
    }

    reset() {
        this.clear()
        this.cells.unshift(this.ground.cells[0][0])
        this.cells.unshift(this.ground.cells[0][1])
    }
}