import { defineComponent, ref } from "vue";
import { ground } from "../Ground";

const snakeState = ground.snake.state

export default defineComponent({
    setup() {
        const speed = ref(snakeState.speed)
        const useSpeed = () => snakeState.speed = speed.value
        return () =>
            <div style={{ width: '100%', marginTop: '20px' }}>
                <h4>State</h4>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td>speed</td>
                            <td style={{ textAlign: 'right' }}>
                                <a-input-number
                                    min={250}
                                    max={2000}
                                    value={speed.value}
                                    onChange={(e: number) => speed.value = e}
                                    pressEnter={useSpeed}>
                                </a-input-number>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    }
})