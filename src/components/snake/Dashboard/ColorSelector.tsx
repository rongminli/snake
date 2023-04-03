import { settingsStore } from '@/stores/settings';
import { defineComponent } from 'vue';
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

export const ColorSelector = defineComponent({
    components: { ColorPicker },
    setup() {
        const settings = settingsStore()
        const colorKeys = Object.keys(settings.colors) as (keyof typeof settings.colors)[]
        return () =>
            <div style={{ marginTop: '20px' }}>
                <h4>Colors</h4>
                <table style={{ width: '100%' }}>
                    <tbody>
                        {colorKeys.map((key) =>
                            <tr>
                                <td >{key}</td>
                                <td style={{ textAlign: 'right' }}><ColorPicker
                                    pureColor={settings.colors[key]}
                                    onPureColorChange={c => settings.colors[key] = c}
                                    format={'hex6'} /></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
    }
})