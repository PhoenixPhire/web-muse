<style lang="scss">
</style>

<template>
  <canvas id="chart" width="1000" height="500"></canvas>
</template>

<script>
import {SmoothieChart, TimeSeries} from 'smoothie';
export default {
  data() {
    return {
      data: null
    }
  },
  ready() {
    var x = new TimeSeries();
    var y = new TimeSeries();
    var z = new TimeSeries();
    var w = new TimeSeries();

    var chart = new SmoothieChart();
    chart.addTimeSeries(x, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 4 });
    chart.addTimeSeries(y, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 4 });
    chart.addTimeSeries(z, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 4 });
    chart.addTimeSeries(w, { strokeStyle: 'rgba(100, 100, 100, 1)', fillStyle: 'rgba(100, 100, 100, 0.2)', lineWidth: 4 });
    chart.streamTo(document.getElementById("chart"), 500);

    var socket = new WebSocket('ws://127.0.0.1:10138/myo/3?appid=io.isobit.hello');
    socket.onmessage = (msg) => {
      var data = JSON.parse(msg.data)[1];
      if (data.type == 'orientation') {
        var now = new Date().getTime();
        x.append(now, data.orientation.x);
        y.append(now, data.orientation.y);
        z.append(now, data.orientation.z);
        w.append(now, data.orientation.w);
      }
    };
  }
}
</script>
