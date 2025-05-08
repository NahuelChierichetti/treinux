import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import MultiSelect from 'primevue/multiselect'

export default (app) => {
  app.use(PrimeVue, { ripple: true })

  app.component('Button', Button)
  app.component('InputText', InputText)
  app.component('Dialog', Dialog)
  app.component('DataTable', DataTable)
  app.component('Column', Column)
  app.component('MultiSelect', MultiSelect)
}
