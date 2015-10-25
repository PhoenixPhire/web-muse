<style lang="scss">
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
    var eeg1 = new TimeSeries();
    var eeg2 = new TimeSeries();
    var eeg3 = new TimeSeries();
    var eeg4 = new TimeSeries();

    var socket = window.socket = io.connect('localhost:8080');
    socket.emit('config', {rate: 100});
    socket.emit('subscribe', {address: '/muse/eeg'});
    socket.on('/muse/eeg', (data) => {
      this.data = data;
      var now = new Date().getTime();
      eeg1.append(now, data.args[0]);
      eeg2.append(now, data.args[1]);
      eeg3.append(now, data.args[2]);
      eeg4.append(now, data.args[3]);
    });

    var chart = new SmoothieChart();
    chart.addTimeSeries(eeg1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 4 });
    chart.addTimeSeries(eeg2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
    chart.addTimeSeries(eeg3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 4 });
    chart.addTimeSeries(eeg4, { strokeStyle: 'rgba(100, 100, 100, 1)', fillStyle: 'rgba(100, 100, 100, 0.2)', lineWidth: 4 });
    chart.streamTo(document.getElementById("chart"), 500);
  }
}
</script>
