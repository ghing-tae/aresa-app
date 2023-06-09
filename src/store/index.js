import { createStore } from "vuex";

export default createStore({
  state: {
    historicalPrices: null,
    futurePrices: null,
  },
  mutations: {
    setHistoricalPrices(state, historicalPrices) {
      state.historicalPrices = historicalPrices;
    },
    setFuturePrices(state, futurePrices) {
      state.futurePrices = futurePrices;
    },
  },
  actions: {
    saveHistoricalPrices({ commit }, historicalPrices) {
      commit("setHistoricalPrices", historicalPrices);
    },
    saveFuturePrices({ commit }, futurePrices) {
      commit("setFuturePrices", futurePrices);
    },
  },
  modules: {},
});
