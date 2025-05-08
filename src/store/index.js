import { createStore } from 'vuex'

const store = createStore({
  state: {
    user: null,
    currentGimnasio: null,
    gimnasios: []
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload
    },
    clearUser(state) {
        state.user = null
    },
    setCurrentGimnasio(state, gimnasio) {
      state.currentGimnasio = gimnasio
    },
    setGimnasios(state, payload) {
      state.gimnasios = payload
    }
  },
  actions: {
    setUser({ commit }, user) {
        commit('setUser', user)
    },
    setCurrentGimnasio({ commit }, gimnasio) {
      commit('setCurrentGimnasio', gimnasio)
      localStorage.setItem('treinux_gimnasio', JSON.stringify(gimnasio))
    },
    logout({ commit }) {
      commit('clearUser')
      commit('setCurrentGimnasio', null)
      localStorage.removeItem('treinux_user')
      localStorage.removeItem('treinux_gimnasio')
    },
    setGimnasios({ commit }, gimnasios) {
      commit('setGimnasios', gimnasios)
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    getCurrentGimnasio: state => state.currentGimnasio,
    getUser: state => state.user,
  }
})

export default store
