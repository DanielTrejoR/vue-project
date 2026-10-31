import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Llamadas a la API de posts; las vistas guardan los datos que reciben
export const usePostsStore = defineStore('posts', {
    actions: {
        async fetchPosts({ page = 1, size = 10, filters }) {
            const res = await axiosClient.get('/admin/posts', {
                params: { page, perpage: size, ...filters },
            })
            return res.data
        },
        async fetchCategoriesAndTags() {
            const res = await axiosClient.get('/admin/posts/create')
            return res.data
        },
        async storePost(postData) {
            const res = await axiosClient.post('/admin/posts', postData)
            return res.data
        },
        async updatePost({ postId, postData }) {
            const res = await axiosClient.put(`/admin/posts/${postId}`, postData)
            return res.data
        },
        editPost(postId) {
            return axiosClient.get(`/admin/posts/${postId}/edit`)
        },
        deletePhoto(photoId) {
            return axiosClient.delete(`/admin/photo/${photoId}`)
        },
        getHistory(postId) {
            return axiosClient.get(`/admin/posts/${postId}/history`)
        },
        deletePost(post) {
            return axiosClient.delete(`/admin/posts/${post}`)
        },
        // listados públicos paginados (blog, categoría, etiqueta)
        getPosts({ url, page }) {
            return axiosClient.get(url, { params: { page } })
        },
        viewPost(url) {
            return axiosClient.get(`/posts/${url}`)
        },
        storeComment({ comment, postId }) {
            return axiosClient.post(`/posts/${postId}/comments`, { comment })
        },
        updateComment({ postId, commentId, comment }) {
            return axiosClient.put(`/posts/${postId}/comments/${commentId}`, { comment })
        },
        deleteComment({ postId, commentId }) {
            return axiosClient.delete(`/posts/${postId}/comments/${commentId}`)
        },
        storeRating({ rating, postId }) {
            return axiosClient.post(`/posts/${postId}/ratings`, { rating })
        },
    },
})
