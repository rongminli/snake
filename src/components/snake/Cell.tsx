import { computed, defineComponent, PropType, reactive, readonly, UnwrapNestedRefs } from "vue";

export interface Point {
    x: number,
    y: number
}

export enum CellViewState {
    SPACE = 0,
    SNAKE_BODY = 1,
    FOOD = 2,
    PATH = 3,
    HEAD = 4,
    TAIL = 5
}

type CellState = {
    viewState: CellViewState
}

export class Cell {
    private state: UnwrapNestedRefs<CellState>
    public pubState
    point: Point
    constructor(position: Point) {
        this.state = reactive<CellState>({
            viewState: CellViewState.SPACE,
        })
        this.pubState = readonly(this.state)
        this.point = position
    }
    private changeState(viewState: CellViewState) {
        this.state.viewState = viewState
    }
    asSpace() {
        this.changeState(CellViewState.SPACE)
    }
    asHead() {
        this.changeState(CellViewState.HEAD)
    }
    asTail() {
        this.changeState(CellViewState.TAIL)
    }
    asFood() {
        this.changeState(CellViewState.FOOD)
    }
    asSnakeBody() {
        this.changeState(CellViewState.SNAKE_BODY)
    }
    asPath() {
        this.changeState(CellViewState.PATH)
    }
    isSpace() {
        return this.state.viewState === CellViewState.SPACE
    }
    isFood() {
        return this.state.viewState === CellViewState.FOOD
    }
    isSnakeBody() {
        return this.state.viewState === CellViewState.SNAKE_BODY
    }
    isPath() {
        return this.state.viewState === CellViewState.PATH
    }
}

export function createCell(position: Point): Cell {
    return new Cell(position)
}

export const CellVue = defineComponent({
    props: {
        cell: {
            type: Object as PropType<Cell>,
            required: true
        }
    },
    setup({ cell }) {
        const cellState = cell.pubState

        const className = computed(() => {
            let className = ''
            switch (cellState.viewState) {
                case CellViewState.SPACE:
                    className = 'space'
                    break
                case CellViewState.SNAKE_BODY:
                    className = 'snake-body'
                    break
                case CellViewState.FOOD:
                    className = 'food'
                    break
                case CellViewState.PATH:
                    className = 'path'
                    break
                case CellViewState.HEAD:
                    className = 'head'
                    break
                case CellViewState.TAIL:
                    className = 'tail'
                    break
            }
            return className
        })

        return () =>
            <div class={'cell ' + className.value}></div>
    }
})