import {
  API_REQUEST,
  API_ERROR,
  API_REQUEST_END
} from '../actions/api';

import {
   Api as baseApi
} from 'nodefony-client';
const Api = new baseApi("mediasoup","/api/mediasoup",{

});

const state = {
  loading: false,
  status: "waiting"
};

const getters = {};

const actions = {
  [API_REQUEST]: ({
    commit,
    dispatch
  },
    opt
  ) =>   {
    return new Promise((resolve, reject) => {
      commit(API_REQUEST)
      let options = {} , url = "", method = "GET" ;
      if( typeof opt === "string"){
        url = opt ;
      }else{
         url = opt.url ;
         method = opt.method || method;
         options = opt.options || options;
      }
      return Api.http(url, method, options)
        .then(response => {
          commit(API_REQUEST_END);
          return resolve(response);
        })
        .catch(err => {
          commit(API_ERROR, err)
          return reject(err)
        })
    })
  }
};
const mutations = {
  [API_REQUEST]: (state) => {
    state.status = 'loading'
    state.loading = true
  },
  [API_ERROR]: (state) => {
    state.status = 'error'
    state.loading = false
  },
  [API_REQUEST_END]: (state) => {
    state.status = 'finished'
    state.loading = false
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}
