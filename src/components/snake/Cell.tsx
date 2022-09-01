import { computed, defineComponent, PropType, reactive, UnwrapNestedRefs } from "vue";

export interface Position {
    x: number,
    y: number
}

export enum CellViewState {
    SPACE = 0,
    SNAKE_BODY = 1,
    FOOD = 2,
    PATH = 3,
}

type CellState = {
    viewState: CellViewState
}

export class Cell {
    state: UnwrapNestedRefs<CellState>
    position: Position
    constructor(position: Position) {
        this.state = reactive<CellState>({
            viewState: CellViewState.SPACE,
        })
        this.position = position
    }
    changeState(viewState: CellViewState) {
        this.state.viewState = viewState
    }
    asSpace() {
        this.changeState(CellViewState.SPACE)
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

export function createCell(position: Position): Cell {
    return new Cell(position)
}

export const CellVue = defineComponent({
    props: {
        cell: {
            type: Object as PropType<Cell>,
            required: true
        }
    },
    setup(props) {
        const { cell } = props
        const cellState = cell.state

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
            }
            return className
        })

        return () =>
            <div class={'cell ' + className.value}></div>
    }
})