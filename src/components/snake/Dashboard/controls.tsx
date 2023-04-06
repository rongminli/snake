import { defineComponent } from "vue";
import { ground } from "../Ground";
import { last } from "../js/smartSnake";

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
                <a-button onClick={()=>last()}>
                    last
                </a-button>
            </div>
    }
})
