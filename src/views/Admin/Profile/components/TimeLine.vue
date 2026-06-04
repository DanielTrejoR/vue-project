<template>
    <div>
        <h2>Historial de Actividad</h2>
        <el-timeline>
            <el-timeline-item
                v-for="activity in activities.data"
                :key="activity.id"
                :timestamp="formatDate(activity.created_at)"
                placement="top"
                :color="activity.description === 'created' ? 'green' : activity.description === 'updated' ? 'blue' : 'red'"
            >
                <el-card>
                <h4>
                    El usuario {{ user.name }} realizó una acción en {{ activity.log_name }}
                </h4>
                <p>{{ activity.description }}</p>
                </el-card>
            </el-timeline-item>
        </el-timeline>
    </div>
</template>
<script setup>
import { useStore } from 'vuex'
import { ref,onMounted } from 'vue';
import dayjs from 'dayjs';
const store = useStore()
const user = store.getters['user'].user
const activities = ref({ data: [] });

function formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const getActivities = async () => {
    store.dispatch('admin/getActivities').then((res) => {
        activities.value = res.data
    }).catch((err) => {
        
    });
}

onMounted(() => {
    getActivities()
})
</script>
