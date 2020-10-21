import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import PostService from '../services/PostService';
import Auth from '../services/Auth';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  state: {
    token: null,
    user: {},
    isLoggedIn: false,
    isLoading: false,
    posts: [],
    users: [],
    post: {},
    message: '',
    error: '',
    isLiked: false,
    isAdmin: false

  },
  plugins: [
    createPersistedState()
  ],
  getters: {
    isAdmin(state) {
      return state.user.admin;
    },
    posts(state) {
      return state.posts;
    },

    post(state) {
      return state.post;
    },
    users(state) {
      return state.users;
    },
    user(state) {
      return state.user;
    },
    messageRetour(state) {
      return state.message;
    },
    errorMessage(state) {
      return state.error;
    },
    isLiked(state) {
      return state.isLiked;
    }
  },


  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        state.isLoggedIn = true;
      } else {
        state.isLoggedIn = false;
      }
    },
    DELETE_TOKEN(state,) {
      state.token = null;
      state.user = '';
      state.isLoggedIn = false;

    },
    SET_USER(state, user) {
      state.user = user;
    },
    GET_USER_BY_ID(state,user) {
      state.user = user
    },
    GET_USERS(state, users) {
      state.users = users
    },
    GET_POSTS(state, posts) {
      state.posts = posts,

        state.isLoading = false
    },
    GET_POST_BY_ID(state, post) {
      state.post = post;
      state.isLoading = false
    },
    ADD_POST(state, post) {
      state.posts = [post, ...state.posts];
      state.message = 'post créé'
    },
    UPDATE_POST(state, id, post) {
      Object.assign(state.posts.find(element => element.id === id), post);
    },

    DELETE_POST(state, id) {
      state.posts = [
        ...state.posts.filter((item) => item.id !== id)
      ];
    },
    UPDATE_ACCOUNT(state,id, user) {     
       Object.assign(state.users.find(element => element.id === id), user); 
    },

    DELETE_ACCOUNT(state, id) {
      state.users = [
        ...state.users.filter((item) => item.id !== id)
      ];
    },
    DELETE_COMMENT(state, id) {
      state.posts = [
        ...state.posts.filter((item) => item.id !== id)
      ];
    },
    LIKE_POST(state, like) {
      state.posts = [like, ...state.posts];

      state.isLiked = like.isLiked;
      console.log(state.isLiked)
    },
    COMMENT_POST(state, comment) {
      state.posts = [comment, ...state.posts];
      state.message = 'post commenté'

    },
    LOG_OUT(state) {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
    }

  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token);
    },
    deleteToken({ commit }, token) {
      commit('DELETE_TOKEN', token);
    },
    logOut({ commit }, ) {
      commit('LOG_OUT');
    },
    setUser({ commit }, user) {
      commit('SET_USER', user);
    },

    deletePost({ commit }, id) {
      PostService.deletePost(id)
        .then(() => {
          commit('DELETE_POST', id)
        })
    },
    deleteAccount({ commit }, id) {
      
      Auth.deleteAccount(id)
        .then(() => {
          if (id === this.state.user.id) {
            commit('DELETE_ACCOUNT', id),
              commit('LOG_OUT')
          } else if(this.state.user.admin === true)
          commit('DELETE_ACCOUNT', id)
        })
    },
    updateAccount({ commit }, data) {
      let id = this.state.user.id
      axios.put(
        `http://localhost:3000/api/users/accounts/${id}`,
        data,
        { headers: { Authorization: this.state.token } }
      )
        .then(response => {
          const user = response.data;  
          console.log(user)       
          commit('UPDATE_ACCOUNT', id, user)
    
        })
        .then(() => {
          Auth.getUserById(id)
            .then(response => {
              const user = response.data;              
              commit('GET_USER_BY_ID', user)
            })
        })
    },
    getPosts({ commit }) {
      PostService.getPosts()
        .then(response => {
          const posts = response.data;
          console.log(posts)

          commit('GET_POSTS', posts)
        })
    },
    getUsers({ commit }) {
      Auth.getUsers()
        .then(response => {
          const users = response.data;
          console.log(users)

          commit('GET_USERS', users)
        })
    },
    getUserById({ commit }) {
      let id = this.state.user.id
      Auth.getUserById(id)
        .then(response => {
          const user = response.data;
          console.log(user)
          commit('GET_USER_BY_ID', user)
        })
    },
    getPostById({ commit }, id,) {
      PostService.getPostById(id)
        .then(response => {
          const post = response.data;
          console.log(post)

          commit('GET_POST_BY_ID', post)
        })
    },
    createPost({ commit }, post) {
      PostService.createPost(post)
        .then(response => {
          const post = response.data;
          console.log(post)
          commit('ADD_POST', post)
        })
    },
    updatePost({ commit }, data) {
      let id = this.state.post.id
      axios.put(
        `http://localhost:3000/api/posts/${id}`,
        data,
        { headers: { Authorization: this.state.token } }
      )
        .then(response => {
          const post = response.data;          
          commit('UPDATE_POST', id, post);

        })
    },
    likePost({ commit }, payload) {
      axios.post(
        `http://localhost:3000/api/posts/${payload.id}/like`,
        payload.data,
        { headers: { Authorization: this.state.token } }
      )
        .then(response => {
          const like = response.data;
          console.log(like)
          commit('LIKE_POST', like);
        })
        .then(() => {
          PostService.getPosts()
            .then(response => {
              const posts = response.data;
              commit('GET_POSTS', posts)
            })
        })
    },
    commentPost({ commit }, payload) {
      axios.post(
        `http://localhost:3000/api/posts/${payload.id}/comments`,
        payload.data,
        { headers: { Authorization: this.state.token } }
      )
        .then(response => {
          const comment = response.data;
          console.log(comment)
          commit('COMMENT_POST', comment);
        })
        .then(() => {
          PostService.getPosts()
            .then(response => {
              const posts = response.data;
              commit('GET_POSTS', posts)
            })
        })
    },
    /* deleteComment ({commit},id) {
      console.log(id)
      axios.post(
        `http://localhost:3000/api/posts/comments/${id}`,
      
        { headers: { Authorization: this.state.token } }
      )
        .then(() => {                      
            commit('DELETE_COMMENT', id)
        })
    }, */
    deleteComment({ commit }, id) {
      PostService.deleteComment(id)
        .then(() => {
          commit('DELETE_COMMENT', id)
        })
        .then(() => {
          PostService.getPosts()
            .then(response => {
              const posts = response.data;
              commit('GET_POSTS', posts)
            })
        })
    },

  },
});
