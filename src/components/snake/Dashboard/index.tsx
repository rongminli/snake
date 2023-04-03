import { defineComponent, StyleValue } from "vue";
import { ColorSelector } from "./ColorSelector";
import Controls from "./controls";
import SnakeState from "./SnakeState";
import { settingsStore } from "@/stores/settings";
import { Checkbox } from "ant-design-vue";
import type Event from "ant-design-vue"

export const DashboardVue = defineComponent({
    setup() {
        const style: StyleValue = {
            paddingTop: '3px'
        }
        const settings = settingsStore()
        return () =>
            <div style={style}>
                <Controls />
                <SnakeState />
                <ColorSelector />
                <div style={{ marginTop: '20px' }}>
                    <h4>View</h4>
                    <Checkbox
                        checked={settings.view.showCoord}
                        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
                        onChange={(e: any) => settings.view.showCoord = e.target.checked}>
                        show coord
                    </Checkbox>
                </div>
            </div>
    }
})