<template>
<v-container fluid>
  <v-card class="mx-auto" max-width="500">
    <v-card-title class="title font-weight-regular justify-space-between">
      <span>Room {{ this.mdRoom.displayName || this.mdRoom.name }}</span>
      <v-chip v-if="room.secure" class="ma-2" color="red lighten-2" text-color="white">
        Secure
      </v-chip>
      <!--v-avatar color="primary lighten-2" class="subheading white--text" size="24" v-text="step"></v-avatar-->
    </v-card-title>
    <v-subheader>{{ currentTitle }}</v-subheader>
    <notify class="ml-5 mr-5" v-if="message" :pdu="message" type="alert" />
    <v-window v-model="step">
      <v-window-item :value="1">
        <div class="pa-4 text-center">
          <v-avatar color="primary lighten-2" class="subheading white--text" size="100">
            {{room.name}}
          </v-avatar>
          <h3 class="title font-weight-light mb-2">Welcome to {{room.description || room.name}}</h3>
          <span class="caption grey--text">Continue To connect</span>
        </div>
      </v-window-item>

      <v-window-item :value="2">
        <v-card-text>
          <v-text-field v-model="peerid" :disabled="isAuthenticated" label="User" :value="peerid"></v-text-field>
          <span class="caption grey--text text--darken-1">
            This is the name you will use to login to Room
          </span>
        </v-card-text>
      </v-window-item>

      <v-window-item :value="3">
        <v-card-text>
          <v-text-field v-model="password" label="Password" type="password" :disabled="! room.secure"></v-text-field>
          <span class="caption grey--text text--darken-1">
            Please enter a password for join room
          </span>
        </v-card-text>
      </v-window-item>
    </v-window>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn name="Back" :disabled="step === 1" text @click="lastStep">
        Back
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if='step < 2 || (room.secure && step ===2) ' name="Next" color="primary" depressed @click="lastStep">
        Next
      </v-btn>
      <v-btn v-if='step === 3 || (! room.secure && step ===2)' name="Join" :disabled="(room.secure && password === '') || ! peerid " color="primary" depressed @click="lastStep">
        Join
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog v-model="dialog" persistent max-width="600" eager>
    <v-card>
      <v-system-bar color="indigo darken-2" dark>
        <v-icon @click="agree"> mdi-close</v-icon>
      </v-system-bar>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-avatar color="blue-grey" size="125">
              <span class="white--text headline">{{peerid}}</span>
            </v-avatar>
          </v-col>
          <v-col cols="12" sm="8" md="4">
            <video ref="video" width="100%" height="100%" muted />
            <v-btn small color="blue-grey" class="ma-2 white--text" fab @click="videoButton">
              <v-icon v-if="this.video">mdi-video-box</v-icon>
              <v-icon v-else dark>mdi-video-box-off</v-icon>
            </v-btn>
            <v-btn small color="blue-grey" class="ma-2 white--text" fab @click="audioButton">
              <v-icon v-if="this.audio">mdi-volume-high</v-icon>
              <v-icon v-else dark>mdi-volume-off</v-icon>
            </v-btn>
            <v-btn small color="blue-grey" class="ma-2 white--text" fab @click="screenButton">
              <v-icon v-if="this.screen">mdi-monitor-share</v-icon>
              <v-icon v-else dark>mdi-monitor-off</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <v-card-title class="headline">
        Join to {{room.name}} Room ?
      </v-card-title>
      <v-card-subtitle>
        Peer : {{peerid}}
      </v-card-subtitle>
      <v-card-actions>
        <v-btn small name="desagree" class="ma-3" @click="agree">Disagree</v-btn>
        <v-btn small name="agree" class="ma-3" outlined @click="agree">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import Media from "@/components/Media";
import notify from '@/plugins/nodefony/components/notify.vue';

export default {
  name: 'Room',
  components: {
    Media,
    notify
  },
  props: {
    room: {
      type: Object,
      default: null
    },
    peerId: {
      type: String,
      default: ""
    },
    join: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {
      message: null,
      mdRoom: vm.room,
      peerid: vm.peerId,
      peer: null,
      step: 1,
      dialog: false,
      peerElement: "me",
      mediasoupRoom: null,
      audio: true,
      video: true,
      screen: false,
      stream: null,
      password: ""
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser'
    ]),
    currentTitle() {
      //let name = `Room ${this.mdRoom.displayName || this.mdRoom.name}`;
      switch (this.step) {
        case 1:
          return "";
        case 2:
          return `Connect User`
        default:
          return `Authorization`;
      }
    }
  },
  async beforeMount() {

  },
  async mounted() {
    if (!this.peerd) {
      this.peerid = this.getUser;
    }
    if (this.join) {
      return await this.joinRoom();
    }
  },
  destroyed() {
    this.mdRoom = null;
    this.mediasoupRoom = null;
    this.peer = null;
    this.stopStream();
  },

  watch: {
    stream(value) {
      const tag = this.$refs.video;
      if (value) {
        this.log(`Add stream ${value.id} on video tag `);
        tag.srcObject = value;
        return this.$nextTick(() => {
          //ag.srcObject = value;
          return tag.play()
            .then(() => {
              this.log(`play stream ${value.id}`);
              return value
            })
            .catch(e => {
              this.log(e, "ERROR");
              throw e
            })
        });
      }
      delete tag.srcObject;
      tag.srcObject = null;
    }
  },
  methods: {
    ...mapActions(["API_REQUEST"]),
    async getUserMedia() {
      this.log("Auth UserMedia");
      return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        })
        .then((stream) => {
          this.stream = stream;
          this.screen = false;
          this.video = true;
          return stream;
        }).catch(e => {
          this.log(e, "ERROR");
          this.video = false;
        });
    },
    async getDisplayMedia() {
      return await navigator.mediaDevices.getDisplayMedia()
        .then((stream) => {
          this.stream = stream;
          this.screen = true;
          this.video = false;
          return stream;
        }).catch(e => {
          this.log(e, "ERROR");
          this.screen = false;
        });
    },
    async lastStep(event) {
      switch (event.currentTarget.name) {
        case "Next":
          if (this.step === 1 && !this.room.secure) {
            this.step = 2
          } else {
            this.step++;
          }
          break;
        case "Back":
          if (this.step === 2 && !this.room.secure) {
            this.step = 1
          } else {
            this.step--;
          }
          break;
        case "Join":
          return this.joinRoom();
        default:
          return;
      }
    },
    async joinRoom() {
      this.message = null;
      if (this.room.secure) {
        this.log(`check access room ${this.peerid} : ${this.password}`)
        return this.API_REQUEST({
            url: "/room/api/secure",
            method: "post",
            options: {
              body: JSON.stringify({
                room: this.room,
                user: this.peerid,
                password: this.password
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            }
          })
          .then(async (res) => {
            return await this.getUserMedia()
              .then((stream) => {
                this.dialog = true;
                return stream;
              });
          })
          .catch(e => {
            let error = this.log(e, "ERROR", "ROOM");
            this.message = error;
          })
      }
      return await this.getUserMedia()
        .then((stream) => {
          this.dialog = true;
          return stream;
        });
    },
    async agree(event) {
      let response = null;
      switch (event.currentTarget.name) {
        case "agree":
          response = true;
          break;
        default:
          response = false;
      }
      this.log(`response : ${response}`, "DEBUG");
      this.$emit('join', response);
      if (response) {
        return await this.connect();
      }
      this.stopStream();
      this.dialog = false;
      this.step = 1;
    },
    async connect() {
      await this.$mediasoup.connect(this.mdRoom.name, this.peerid)
        .then(({
          room,
          peer
        }) => {
          this.peer = peer;
          this.mediasoupRoom = room;
          this.$emit('connect', room, peer);
          this.dialog = false;
          return {
            room,
            peer
          }
        })
        .catch((e) => {
          this.dialog = false;
          this.log(e, "ERROR");
        });
    },
    videoButton() {
      if (!this.video) {
        return this.getUserMedia();
      } else {
        this.stopStream();
        this.video = false;
      }
    },
    audioButton() {
      this.audio = !this.audio;
    },
    stopStream() {
      if (this.stream) {
        const tracks = this.stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        this.stream = null;
      }
    },
    async screenButton() {
      if (!this.screen) {
        return await this.getDisplayMedia();
      } else {
        this.stopStream();
        this.screen = false;
        return await this.getUserMedia();
      }
    },
  }
}
</script>
