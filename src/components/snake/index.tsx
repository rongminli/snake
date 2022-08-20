import { defineComponent } from 'vue';
import { createGround, GroundVue } from './Ground';
import { DashboardVue } from './Dashboard';
import './style.scss'

export default defineComponent({
    setup() {
        const ground = createGround()

        const style = {
            display: 'flex'
        }

        return () =>
            <div class="snakeContainer" style={style}>
                <GroundVue ground={ground} />
                <DashboardVue ground={ground} />
            </div>
    }
})