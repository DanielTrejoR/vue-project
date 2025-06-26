<template>
    <v-container>
        <v-list-item
          prepend-avatar=""
          :title="title"
        ></v-list-item>

        <v-divider></v-divider>
        <v-row>
            <v-col
                cols="12"
                sm="12"
                md="12"
                
            >
                <v-switch
                v-model="switche"
                label="red"
                color="red"
                value="red"
                hide-details
                ></v-switch>
                <v-switch
                v-model="switche"
                label="orange-darken-3"
                color="orange-darken-3"
                value="orange-darken-3"
                hide-details
                ></v-switch>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
export default{
    props: {
        title: {
            type: String,
            require: false,
            default: "Config"
        }
    },
    data: () => ({
        switche: false
    }),
}
</script>
