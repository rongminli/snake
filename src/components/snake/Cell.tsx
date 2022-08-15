import { computed, defineComponent, ref } from "vue";

type Position = {
    x: number,
    y: number
}

enum CellState {
    SPACE = 0,
    SNAKE_BODY = 1,
    FOOD = 2,
}

export default defineComponent({
    props: {
        position: Position
    },
    setup(props) {
        const { position } = props

        const cellState = ref(CellState.SPACE)

        const className = computed(() => {
            let className = ''
            switch (cellState.value) {
                case CellState.SPACE:
                    className = 'space'
                    break
                case CellState.SNAKE_BODY:
                    className = 'snake-body'
                    break
                case CellState.FOOD:
                    className = 'food'
                    break
            }
            return className
        })

        function changeState(state: CellState) {
            cellState.value = state
        }

        defineExpose({
            position,
            asSpace: () => changeState(CellState.SPACE),
            asFood: () => changeState(CellState.FOOD),
            asSnakeBody: () => changeState(CellState.SNAKE_BODY),
            isSpace: () => cellState.value === CellState.SPACE,
            isFood: () => cellState.value === CellState.FOOD,
            isSnakeBody: () => cellState.value === CellState.SNAKE_BODY
        })

        return {
            className,
        }
    },
    render() {
        return <div class={'cell ' + this.className }></div>
    }
})