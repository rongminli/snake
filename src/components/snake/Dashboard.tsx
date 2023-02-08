import { defineComponent, PropType } from "vue";
import { Ground } from "./Ground";

export const DashboardVue = defineComponent({
    props: {
        ground: {
            type: Object as PropType<Ground>,
            required: true
        }
    },

    setup({ ground }) {
        const snakeBodyCells = ground.snake.body.cells
        const groundState = ground.state

        return () =>
            <div>
                <button onClick={groundState.isActive ? ground.pause.bind(ground) : ground.start.bind(ground)}>
                    {groundState.isActive ? '暂停' : '开始'}
                </button>
                <button onClick={ground.restart}>
                    重置
                </button>
                {/* <button onClick={ground.snake.auto.bind(ground.snake)}>
                    自动
                </button> */}
                <div>积分：{snakeBodyCells.length}</div>
            </div>
    }
})