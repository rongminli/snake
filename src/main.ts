import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { Button, message, Input, Form , InputNumber} from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

const app = createApp(App)
app.use(createPinia())
    .use(Button)
    .use(Input)
    .use(InputNumber)
    .use(Form)
    .mount('#app')
app.config.globalProperties.$message = message;

