import { computed, defineComponent, PropType, Ref, ref } from "vue";

export interface Position {
    x: number,
    y: number
}

export enum CellViewState {
    SPACE = 0,
    SNAKE_BODY = 1,
    FOOD = 2,
}

export interface Cell {
    viewState:  Ref<CellViewState>
    position: Position
    asSpace: () => void,
    asFood: () => void,
    asSnakeBody: () => void,
    isSpace: () => boolean,
    isFood: () => boolean,
    isSnakeBody: () => boolean
}

export function createCell(position: Position): Cell {
    const viewState = ref(CellViewState.SPACE)
    function changeState(_state: CellViewState) {
        viewState.value = _state
    }
    return {
        viewState: viewState,
        position,
        asSpace: () => changeState(CellViewState.SPACE),
        asFood: () => changeState(CellViewState.FOOD),
        asSnakeBody: () => changeState(CellViewState.SNAKE_BODY),
        isSpace: () => viewState.value === CellViewState.SPACE,
        isFood: () => viewState.value === CellViewState.FOOD,
        isSnakeBody: () => viewState.value === CellViewState.SNAKE_BODY
    }
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
        const cellViewState = cell.viewState
        const className = computed(() => {
            let className = ''
            switch (cellViewState.value) {
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

        return () => <div class={'cell ' + className.value}></div>
    }
})