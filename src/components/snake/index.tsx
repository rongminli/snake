import { defineComponent } from 'vue';
import { GroundVue} from './Ground';
import { DashboardVue } from './Dashboard/index';
import './style.scss'

export default defineComponent({
    setup() {
        const style = {
            display: 'flex'
        }
        return () =>
            <div class="snakeContainer" style={style}>
                <GroundVue/>
                <div style={{width:'30px'}} />
                <DashboardVue/>
            </div>
    }
})