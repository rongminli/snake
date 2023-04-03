import { defineComponent } from "vue";
import { ground } from "../Ground";

export default defineComponent({
    setup() {
        const groundState = ground.state
        return () =>
            <div>
                <a-button onClick={groundState.isActive ? ground.pause.bind(ground) : ground.start.bind(ground)}>
                    {groundState.isActive ? 'pause' : 'start'}
                </a-button>
                <a-button onClick={ground.snake.auto.bind(ground.snake)}>
                    auto
                </a-button>
                <a-button onClick={ground.restart}>
                    reset
                </a-button>
            </div>
    }
})
