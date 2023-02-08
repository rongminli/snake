import { computed, defineComponent, PropType, reactive, readonly, UnwrapNestedRefs } from "vue";

export interface Coord {
    x: number,
    y: number
}

export enum CellViewState {
    SPACE = 'space',
    SNAKE_BODY = 'snake-body',
    FOOD = 'food',
    PATH = 'path',
    HEAD = 'head',
    TAIL = 'tail'
}

type CellState = {
    viewState: CellViewState
}

export class Cell {
    private state: UnwrapNestedRefs<CellState>
    public pubState
    coord: Coord

    constructor(coord: Coord) {
        this.state = reactive<CellState>({
            viewState: CellViewState.SPACE,
        })
        this.pubState = readonly(this.state)
        this.coord = coord
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

export function createCell(coord: Coord): Cell {
    return new Cell(coord)
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
            <div class={`cell ${className.value}`} />
    }
})