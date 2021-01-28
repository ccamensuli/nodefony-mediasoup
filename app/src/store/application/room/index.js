const now = new Date();

const setStorage = (item, value) => {
  try {
    return window.sessionStorage.setItem(item, JSON.stringify(value));
  } catch (e) {
    console.error(e, item, value);
  }
};

const getStorage = (item) => {
  try {
    return JSON.parse(window.sessionStorage.getItem(item));
  } catch (e) {
    console.error(e, item);
  }
};

const state = {
  clock: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
  sideBar: getStorage("roomsidebar") || false,
  dialogJoin: true,
  dialogQuit: false,
  medias: getStorage("medias") || ["audio", "video"],
  peers: [],
  slider: true,
  layout:true,
};

const getters = {
  getClock(state) {
    return state.clock;
  },
  getSideBar(state) {
    return state.sideBar;
  },
  getJoinDialog(state) {
    return state.dialogJoin;
  },
  dialogQuit(state) {
    return state.dialogQuit;
  },

  // user medias
  hasAudio(state) {
    return state.medias.includes("audio");
  },
  hasVideo(state) {
    return state.medias.includes("video");
  },
  hasScreen(state) {
    return state.medias.includes("screen");
  },
  hasNoise(state) {
    return state.medias.includes("noise");
  },
  getMedias(state) {
    return state.medias;
  },

  // remote peers
  peers(state) {
    return state.peers;
  },
  getRemotePeer(state) {
    return (peerId) => {
      let find = state.peers.findIndex((peer) => {
        return peer.id === peerId;
      });
      if (find !== -1) {
        return state.peers[find];
      }
      return null;
      //throw new Error(`No peer found ${peerId}`);
    }
  },
  // layouts
  slider(state) {
    return state.slider;
  },
  layout(state){
    return state.layout;
  }
}

const mutations = {
  setClock(state) {
    const now = new Date();
    state.clock = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  },
  setSideBar(state, value) {
    this.commit('setUnreadMessage', 0)
    state.sideBar = (value === undefined) ? false : value;
    setStorage('roomsidebar', state.sideBar);
  },
  openJoinDialog(state) {
    state.dialogJoin = true;
  },
  closeJoinDialog(state) {
    state.dialogJoin = false;
  },
  openQuitDialog(state) {
    state.dialogQuit = true;
  },
  closeQuitDialog(state) {
    state.dialogQuit = false;
  },
  setMedia(state, type) {
    let index = state.medias.indexOf(type);
    if (index < 0) {
      state.medias.push(type);
      if (type === 'screen' || type === 'noise'){
        return;
      }
      this.commit("storeMedias", state.medias);
    }
  },
  storeMedias(state, value) {
    state.medias = value;
    setStorage('medias', value);
    return state.medias;
  },
  deleteMedias(state, type) {
    let index = state.medias.indexOf(type);
    if (index >= 0) {
      state.medias.splice(index, 1);
      this.commit("storeMedias", state.medias);
    }
  },

  // remote peer
  addRemotePeer(state, value) {
    state.peers.push(value);
  },
  removePeer(state, id) {
    let index = state.peers.findIndex((peer) => {
      return peer.id === id;
    });
    if (index >= 0) {
      state.peers.splice(index, 1);
    }
  },
  removeAllPeers(state) {
    while (state.peers.length > 0) {
      state.peers.pop();
    }
  },
  //layout
  toogleSlider(state) {
    state.slider = !state.slider;
  },
  displayLayout(state) {
    state.layout = true;
  }
}

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
}
