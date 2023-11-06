<template>
    <div>
        <h1 class=" " style="padding-top:5px">leaving u </h1>
        <button @click="show = !show">Toggle</button>
        <Transition
            enter-active-class="animate__animated animate__fadeInDown"
            leave-active-class="animate__animated animate__fadeOut">
            <p v-if="show">hello</p>
        </Transition>
    </div>
</template>
<script>
export default {
    data: () => ({
        show: false,
    })
}
</script>