import {
  USER_REQUEST,
  USER_ERROR,
  USER_SUCCESS,
  USER_LOADING,
  USER_PROFILE
} from '../actions/user'


import {
  Api as baseApi
} from 'nodefony-client';
const Api = new baseApi("mediasoup","/api/users",{
});

/*import {
  api as Api
} from '@/../../../nodefony-core/src/nodefony'*/
// import Vue from 'vue';
import {
  AUTH_LOGOUT
} from '../actions/auth'

const state = {
  status: '',
  error: null,
  user: null
}

const getters = {
  getProfile: state => state.user,
  getRoles(state) {
    if (state.user) {
      return state.user.roles
    }
    throw new Error('User profile not defined !')
  },
  hasRole(state, role) {
    if (state.user) {
      const res = state.user.roles.indexOf(role)
      if (res > 0) {
        return true
      }
      return false
    }
    throw new Error('User profile not defined !')
  },
  isProfileLoaded: state => state.status === 'success',
  getTrigramme(state){
    if (state.user){
      let size = state.user.surname.length;
      return `${state.user.name.substr(0, 1)}${state.user.surname.substr(0, 1)}${state.user.surname.substr(size-1,1)}`;
    }
    return "";
  }

}

const actions = {
  [USER_REQUEST]: ({
    commit,
    dispatch
  }, url) => {
    commit(USER_LOADING)
    return Api.http(url)
      .then(resp => {
        console.log(resp)
        commit(USER_SUCCESS, resp)
        commit(USER_PROFILE, resp.result)
        return resp
      })
      .catch(e => {
        commit(USER_ERROR, e)
        throw e ;
      })
  }
}

const mutations = {
  [USER_LOADING]: (state) => {
    state.status = 'loading'
  },
  [USER_SUCCESS]: (state, resp) => {
    state.status = 'success'
    // Vue.set(state, 'profile', resp.result)
  },
  [USER_ERROR]: (state, error) => {
    state.status = 'error'
    state.error = error
  },
  [AUTH_LOGOUT]: (state) => {
    state.status = ''
    state.user = null
  },
  [USER_PROFILE]: (state, user) => {
    state.user = user
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
