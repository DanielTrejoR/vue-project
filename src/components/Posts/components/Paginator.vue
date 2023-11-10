<template>
    <div>
        <Component :is="componentName" :items="items"></Component>

        <PaginationLinks :pagination="pagination"></PaginationLinks>
    </div>
</template>
<script>
export default {
    props: ['url', 'componentName'],
    data(){
        return {
            pagination: {},
            items: []
        }
    },
    mounted(){
        axios.get(`${ this.url }?page=${this.$route.query.page || 1}`) //Post controller
            .then(res => {
                this.pagination = res.data;
                this.items = res.data.data;
                delete this.pagination.data;
            })
            .catch(err => {
                console.log(err);
            })
    }
}
</script>