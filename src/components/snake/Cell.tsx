import { computed, defineComponent, PropType, reactive, UnwrapNestedRefs } from "vue";

export interface Position {
    x: number,
    y: number
}

export enum CellViewState {
    SPACE = 0,
    SNAKE_BODY = 1,
    FOOD = 2,
}

type CellState = {
    viewState: CellViewState
}

// export interface Cell {
//     state: DeepReadonly<UnwrapNestedRefs<CellState>>,
//     asSpace: () => void,
//     asFood: () => void,
//     asSnakeBody: () => void,
//     isSpace: () => boolean,
//     isFood: () => boolean,
//     isSnakeBody: () => boolean
// }

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
    isSpace() {
        return this.state.viewState === CellViewState.SPACE
    }
    isFood() {
        return this.state.viewState === CellViewState.FOOD
    }
    isSnakeBody() {
        return this.state.viewState === CellViewState.SNAKE_BODY
    }
}

export function createCell(position: Position): Cell {
    return new Cell(position)
}

// export function createCell(position: Position): Cell {
//     const state = reactive<CellState>({
//         viewState: CellViewState.SPACE,
//         position
//     })

//     function changeState(viewState: CellViewState) {
//         state.viewState = viewState
//     }

//     return {
//         state: readonly(state),
//         asSpace: () => changeState(CellViewState.SPACE),
//         asFood: () => changeState(CellViewState.FOOD),
//         asSnakeBody: () => changeState(CellViewState.SNAKE_BODY),
//         isSpace: () => state.viewState === CellViewState.SPACE,
//         isFood: () => state.viewState === CellViewState.FOOD,
//         isSnakeBody: () => state.viewState === CellViewState.SNAKE_BODY
//     }
// }


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
            }
            return className
        })

        return () =>
            <div class={'cell ' + className.value}></div>
    }
})