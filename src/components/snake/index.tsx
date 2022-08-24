import { defineComponent } from 'vue';
import { createGround, GroundVue } from './Ground';
import { DashboardVue } from './Dashboard';
import './style.scss'

export default defineComponent({
    setup() {
        const ground = createGround()

        // ground.snake.auto(); 

        const style = {
            display: 'flex'
        }

        onblur = () => ground.pause()


        return () =>
            <div class="snakeContainer" style={style}>
                <GroundVue ground={ground} />
                <DashboardVue ground={ground} />
            </div>
    }
})