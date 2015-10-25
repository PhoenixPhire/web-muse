<style lang="scss">
body {
  background-color: #222;
  color: white;
}
</style>

<template>
  <pre>{{data | json 4}}</pre>
  <canvas id="chart" width="1000" height="500"></canvas>
</template>

<script>
import io from 'socket.io-client';
import {SmoothieChart, TimeSeries} from 'smoothie';

export default {
  data() {
    return {
      data: null
    }
  },
  ready() {
    var concentration = new TimeSeries();

    var socket = window.socket = io.connect('localhost:8080');
    socket.emit('config', {rate: 100});
    socket.emit('subscribe', {address: '/muse/elements/experimental/mellow'});
    socket.on('/muse/elements/experimental/mellow', (data) => {
      this.data = data;
      var now = new Date().getTime();
      concentration.append(now, data.args[0]);
    });

    var chart = new SmoothieChart();
    chart.addTimeSeries(concentration, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 4 });
    chart.streamTo(document.getElementById("chart"), 500);
  }
}
</script>
