<template>
  <div>
    <h1>{{ title }}</h1>
    <div>
      <canvas
        ref="chartCanvas"
        style="width: 100%; height: 300px"
        @rendered="drawGraph"
      ></canvas>
    </div>
    <div>
      <h2>Historical Prices</h2>
      <ul>
        <li v-for="price in historicalPrices" :key="price">
          {{ price }}
        </li>
      </ul>
    </div>
    <div>
      <h2>Future Prices</h2>
      <ul>
        <li v-for="price in futurePrices" :key="price">{{ price }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import Chart from "chart.js/auto";

export default {
  data() {
    return {
      title: "2023년 아리사 아파트 101동 202호 과거 시세 및 전망",
      chart: null,
    };
  },
  computed: {
    ...mapState(["historicalPrices", "futurePrices"]),
  },
  mounted() {
    this.fetchHistoricalPrices();
    this.fetchFuturePrices();
  },
  methods: {
    async fetchHistoricalPrices() {
      try {
        const response = await axios.get(
          "http://localhost:3000/aresa-api/historical_prices?aptId=101&year=2023&monthStart=1&monthEnd=12"
        );
        const historicalPrices = response.data.value;
        console.log("Historical Prices:", historicalPrices);
        this.$store.dispatch("saveHistoricalPrices", historicalPrices);
        this.drawGraph();
      } catch (error) {
        console.error(error);
      }
    },
    async fetchFuturePrices() {
      try {
        const response = await axios.get(
          "http://localhost:3000/aresa-api/future_prices?aptId=101&year=2023&monthStart=1&monthEnd=12"
        );
        const futurePrices = response.data.value;
        console.log("Future Prices:", futurePrices);
        this.$store.dispatch("saveFuturePrices", futurePrices);
        this.drawGraph();
      } catch (error) {
        console.error(error);
      }
    },
    drawGraph() {
      this.$nextTick(() => {
        const canvas = this.$refs.chartCanvas;
        if (!canvas) {
          console.error("Cannot find canvas element.");
          return;
        }
        if (!canvas.isConnected) {
          console.log("Canvas is not connected to the DOM yet.");
          return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Cannot get 2D context from canvas.");
          return;
        }

        const labels = Array.from({ length: 12 }, (_, i) => i + 1);
        const datasets = [
          {
            label: "Historical Prices",
            data: this.historicalPrices,
            backgroundColor: "rgba(0, 0, 255, 0.2)",
            borderColor: "rgba(0, 0, 255, 1)",
            borderWidth: 1,
          },
          {
            label: "Future Prices",
            data: this.futurePrices,
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            borderColor: "rgba(0, 255, 0, 1)",
            borderWidth: 1,
          },
        ];

        if (this.chart) {
          this.chart.destroy();
        }

        if (
          labels.length > 0 &&
          datasets.length > 0 &&
          this.historicalPrices &&
          this.futurePrices
        ) {
          this.chart = new Chart(ctx, {
            type: "line",
            data: {
              labels,
              datasets,
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        }
      });
    },
  },
};
</script>

<style>
h1 {
  font-size: 24px;
  font-weight: bold;
}

h2 {
  font-size: 18px;
  font-weight: bold;
}
</style>
