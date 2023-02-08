import { defineComponent } from 'vue';
import { createGround, GroundVue, Ground } from './Ground';
import { DashboardVue } from './Dashboard';
import './style.scss'
import { installEvent, Event } from './utils';

class SnakeGame {
    ground : Ground
    constructor() {
        installEvent(this)
        this.ground = createGround()
    }
}

export default defineComponent({
    setup() {
        const snakeGame = new SnakeGame()
        const ground = snakeGame.ground

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