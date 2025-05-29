<template>
    <div class="flex w-full bg-white rounded-md">
        <div class="flex flex-wrap w-full gap-4 p-6 rounded-md items-center">
        <!-- Input de correo -->
        <div class="flex-1 min-w-[200px]">
            <InputText
                v-model="emailInput"
                placeholder="Correo electrónico"
                class="w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
        </div>

        <!-- Dropdown de roles -->
        <div class="min-w-full sm:min-w-[160px]">
            <Dropdown
                v-model="selectedRole"
                :options="roles"
                optionLabel="label"
                optionValue="value"
                placeholder="Rol"
                class="w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
        </div>

        <!-- Botón de invitación -->
        <div class="min-w-full sm:min-w-[160px]">
            <button
            @click="sendInvitation"
            class="p-button-primary btn-treinux w-full"
            >
            Enviar invitación
            </button>
        </div>
        </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6 overflow-x-auto mt-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Equipo</h2>
        </div>
        <div class="overflow-x-auto w-full">
            <ApplicationLoader v-if="loading" />
            <table v-else class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr class="divide-x divide-gray-100">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-[#f54b20] uppercase tracking-wider min-w-[180px]">
                            Nombre
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Creado
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Rol
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(member, index) in teamMembers" :key="index">
                        <td class="px-4 py-3 text-sm text-gray-900 min-w-[180px]">
                            {{ member.nombre }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">
                            {{ formatDate(member.created_at) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">
                            <span class="bg-[#f54b20] py-1 px-2 text-white rounded-md text-xs">
                                {{ member.rol }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500 flex justify-center">
                            <Icon icon="tabler:trash" class="w-4 h-4 text-red-500 cursor-pointer" @click="removeMember(member)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div v-if="invitationsPending.length > 0" class="bg-white shadow rounded-lg p-6 overflow-x-auto mt-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Invitaciones pendientes</h2>
        </div>
        <div class="overflow-x-auto w-full">
            <ApplicationLoader v-if="loading" />
            <table v-else class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr class="divide-x divide-gray-100">
                        <th class="px-4 py-3 text-left text-xs font-semibold text-[#f54b20] uppercase tracking-wider min-w-[180px]">
                            Usuario
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Enviado
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">

                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(member, index) in invitationsPending" :key="index">
                        <td class="px-4 py-3 text-sm text-gray-900 min-w-[180px]">
                            {{ member.email }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">
                            {{ formatDate(member.created_at) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">
                            <span class="bg-gray-300 py-1 px-2 text-gray-700 rounded-md text-xs">
                            Pendiente
                            </span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500 flex justify-center">
                            <Icon icon="tabler:trash" class="w-4 h-4 text-red-500 cursor-pointer" @click="removePendingInvitation(member)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <DialogConfirmDelete
        v-model:visible="showConfirmDelete"
        @confirm="deleteMember"
    />
    <DialogConfirmDelete
        v-model:visible="showConfirmDeleteInvitation"
        @confirm="deleteInvitation"
    />
</template>
  
<script setup>
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import ApplicationLoader from '@/components/ui/ApplicationLoader.vue'
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '@/supabase'
import dayjs from 'dayjs'
import { Icon } from '@iconify/vue'
import DialogConfirmDelete from '@/components/ui/DialogConfirmDelete.vue'
import { useToast } from 'primevue/usetoast'
import emailjs from 'emailjs-com'

const store = useStore()
const toast = useToast()
  
const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)
const roles = [
    { label: 'Profesor', value: 'profesor' },
    { label: 'Alumno', value: 'alumno' },
    { label: 'Dueño', value: 'superadmin' }
]
const teamMembers = ref([])
const loading = ref(true)
const invitationsPending = ref([])
const emailInput = ref('')
const selectedRole = ref('')
const showConfirmDelete = ref(false)
const showConfirmDeleteInvitation = ref(false)
const memberToDelete = ref(null)
const invitationToDelete = ref(null)

const sendInvitation = async () => {
    if (!emailInput.value || !selectedRole.value) return

    const { data, error } = await supabase
        .from('invitaciones')
        .insert([{
            email: emailInput.value,
            rol: selectedRole.value,
            gym_id: currentGimnasio.value.id,
            status: 'pendiente'
        }])
        .select('id')
        .single()

    const invitationLink = `${window.location.origin}/register-member?id=${data.id}`
    console.log('Invitación enviada:', invitationLink)

    try {
        await emailjs.send(
            'service_fednr0e',
            'template_qemayc2',
            {
                to_email: emailInput.value,
                invitation_link: invitationLink,
                rol: selectedRole.value,
            },
            '7IkisJ03_kpbgntQ9'
        )

        toast.add({
            severity: 'success',
            summary: 'Invitación enviada',
            detail: `Se envió a ${emailInput.value}`,
            life: 4000
        })

        invitationsPending.value.push({
            email: emailInput.value,
            rol: selectedRole.value,
            status: 'pendiente',
            created_at: new Date().toISOString()
        })

        emailInput.value = ''
        selectedRole.value = null
    } catch (error) {
        console.error('Error al enviar la invitación:', error)
        toast.add({
            severity:'error',
            summary: 'Error',
            detail: 'No se pudo enviar la invitación',
            life: 4000
        })
    }
}

const formatDate = (date) => {
    return dayjs(date).format('DD-MM-YYYY HH:mm')
}

const loadTeamMembers = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .in('rol', ['profesor', 'superadmin'])
        .eq('gym_id', currentGimnasio.value.id)

        data.forEach(member => {
            member.rol = member.rol === 'superadmin' ? 'Dueño' : 'Profesor'
        })

        if (error) return
        teamMembers.value = data
    } catch (error) {
        console.error('Error al cargar los miembros del equipo:', error)
    } finally {
        loading.value = false
    }
}

const loadInvitations = async () => {
    loading.value = true
    const { data, error } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('status', 'pendiente')
        .eq('gym_id', currentGimnasio.value.id)

    if (!error) invitationsPending.value = data
}

const removeMember = async (member) => {
    showConfirmDelete.value = true
    memberToDelete.value = member
}

const deleteMember = async () => {
  if (!memberToDelete.value?.id) return

  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', memberToDelete.value.id)

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el miembro del equipo',
      life: 3000,
    })
    return
  }

  toast.add({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Miembro eliminado',
    life: 3000,
  })

  memberToDelete.value = null
  loadTeamMembers()
}

onMounted(() => {
  loadTeamMembers()
  loadInvitations()
})
</script>

<style scoped>
    .btn-treinux {
        padding: 0.5rem 1rem;
        border: 1px solid #f54b20;
        color: #fff;
        background-color: #f54b20;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
    }
</style>
  