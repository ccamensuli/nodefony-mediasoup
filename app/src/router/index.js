import Vue from 'vue'
import VueRouter from 'vue-router'
import Store from '../store';
import Rooms from '../views/Rooms.vue'
import Room from '../views/Room.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'

const ifAuthenticated = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    next();
    return;
  }
  next('login');
  document.location = `/app/login`;
};

Vue.use(VueRouter)

const routes = [{
    path: '/login',
    name: 'Login',
    component: Login
  }, {
    path: '/',
    name: 'About',
    //route level code-splitting
    //this generates a separate chunk (about.[hash].js) for this route
    //which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "about" */ '../views/About.vue')
 }, {
    path: '/rooms',
    name: 'Rooms',
    component: Rooms
  },  {
    path: '/rooms/:roomid',
    name: 'MettingRoom',
    props: true,
    component: Room
  }, {
    path: '/rooms/:roomid/:peerid',
    name: 'Metting',
    props: true,
    component: Room
 }
];
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  //base: '/mediasoup/',
  routes
});

export default router;
