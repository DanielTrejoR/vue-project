import axiosClient from '~/plugins/axios';


const state = {
    posts: []
}

const mutations = {}

const actions = {
    async fetchPosts({ commit }, data){
        try {
            const res = await axiosClient.get('/admin/posts')
            console.log(res)
            return res.data.posts
        } catch (err) {
            throw err
        }
    },
    async fetchCategoriesAndTags({commit}){
        try {
            const res = await axiosClient.get('/admin/posts/create')
            return res.data
        } catch (err) {
            throw err
        }
    },
    async storePost({commit}, postData){
        try {
            const res = await axiosClient.post('/admin/posts', postData);
            if(res.status === 200){
                return res.data;
            }
        } catch (err) {
            
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}