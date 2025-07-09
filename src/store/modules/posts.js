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
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}