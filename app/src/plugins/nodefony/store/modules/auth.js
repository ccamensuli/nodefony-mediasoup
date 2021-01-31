import {
  AUTH_REQUEST,
  AUTH_ERROR,
  AUTH_SUCCESS,
  AUTH_LOGOUT
} from '../actions/auth'

import {
  // USER_REQUEST,
  USER_PROFILE
} from '../actions/user';


import {
  Api as baseApi
} from 'nodefony-client';
const Api = new baseApi("auth", {
  baseUrl:"/api/jwt"
});
console.log(`Storage : `, window.sessionStorage.getItem('username'))
const state = {
  token: Api.token,
  username: window.sessionStorage.getItem('username'),
  status: '',
  loading: false,
  decodedToken: null
};

const getters = {
  getUser: state => state.username,
  isAuthenticated: state => !!state.token,
  authStatus: state => state.status,
  isLoading: state => state.loading
}

const actions = {
  [AUTH_REQUEST]: ({
    commit,
    dispatch
  }, {
    url,
    username,
    password
  }) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST)
      Api.clearToken();
      return Api.login(url, username, password)
        .then(async response => {
          commit(AUTH_SUCCESS, response.result)
          commit(USER_PROFILE, response.result.user)
          return resolve(response.result)
        })
        .catch(err => {
          commit(AUTH_ERROR, err)
          reject(err)
        })
    })
  },
  [AUTH_LOGOUT]: ({
    commit,
    dispatch
  }) => {
    return new Promise((resolve, reject) => {
      return Api.logout('logout')
        .then(resp => {
          commit(AUTH_LOGOUT)
          return resolve(resp)
        })
        .catch(err => {
          commit(AUTH_LOGOUT)
          commit(AUTH_ERROR, err)
          return reject(err)
        })
    })
  }
}

const mutations = {
  [AUTH_REQUEST]: (state) => {
    state.status = 'loading'
    state.loading = true
    window.sessionStorage.removeItem('username')
    state.username = null;
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success'
    state.loading = false
    state.token = resp.token
    sessionStorage.setItem('username', resp.decodedToken.data.user.username)
    state.username = resp.decodedToken.data.user.username
    state.decodedToken = resp.decodedToken
  },
  [AUTH_ERROR]: (state) => {
    state.status = 'error'
    state.loading = false
  },
  [AUTH_LOGOUT]: (state) => {
    state.token = ''
    state.status = 'logout'
    state.loading = false
    window.sessionStorage.removeItem('username')
    state.username =null
    state.decodedToken = null
  },
  clear(state){
    state.token = null;
    state.decodedToken = null
    state.loading = false;
    window.sessionStorage.removeItem('username')
    state.username =null
    Api.clearToken(true);
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
