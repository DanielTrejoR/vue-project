import axiosClient from '~/plugins/axios';


const state = {
    posts: []
}

const mutations = {}

const actions = {
    async fetchPosts({ commit }, { page = 1, size = 10, filters }){
        try {
            console.log(filters, page, size);
            
            const res = await axiosClient.get(`/admin/posts`, {
                        params: {
                            page,
                            perpage: size,
                            ...filters
                        }
        })
            return res.data
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
            return res.data;
        } catch (err) {
            throw err
        }
    },
    async updatePost({commit}, data){
        try {
            const res = await axiosClient.put(`/admin/posts/${data.postId}`, data.postData);
            return res.data;
        } catch (err) {
            throw err
        }
    },
    async editPost({commit}, postId) {
        try {
            const res = await axiosClient.get(`/admin/posts/${postId}/edit`);
            return res
        } catch (err) {
            throw err
        }
    },
    async deletePhoto({commit}, photoId) {
        try {
            const res = await axiosClient.delete(`/admin/photo/${photoId}`);
            return res;
        } catch (err) {
            throw err
        }
    },
    async getHistory({commit}, postId) {
        try {
            const res = await axiosClient.get(`/admin/posts/${postId}/history`);
            return res;
        } catch (err) {
            throw err
        }
    },
    async deletePost({commit}, post) {
        try{
            const res = await axiosClient.delete(`/admin/posts/${post}`);
            return res;
        }catch (err) {
            throw err
        }
    },
    //Front end urls
    async viewPost({commit}, url){
        try {
            return await axiosClient.get(`/posts/${url}`);
        } catch (error) {
            throw error;
        }
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}