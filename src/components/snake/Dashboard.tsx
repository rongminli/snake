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
        const snakeBodyState = ground.snake.body.state
        const groundState = ground.state

        return () =>
            <div>
                <button onClick={groundState.isActive ? ground.pause : ground.start}>
                    {groundState.isActive ? '暂停' : '开始'}
                </button>
                <div>积分：{snakeBodyState.bodyCells.length}</div>
            </div>
    }
})