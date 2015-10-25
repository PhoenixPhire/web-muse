<style lang="scss">
</style>

<template>
  <shader-canvas v-ref:canvas width="1000" height="600"></shader-canvas>
  <button @click="zeroOrientation = null">Re-Calibrate</button>
</template>

<script>
import io from 'socket.io-client';
import ShaderCanvas from './shadercanvas.vue';

export default {
  components: {
    'shader-canvas': ShaderCanvas
  },
  data() {
    return {
      data: null
    }
  },
  ready() {
    this.$refs.canvas.setShader(`
      precision mediump float;
      varying vec2 position;
      uniform float time;
      uniform float x;
      uniform float y;
      uniform float theta;
      void splodey(float x_cent, float y_cent, float trig, float col, float power, float intensity, vec4 f_col) {
        float vary_x;
        float vary_y;

        if(trig == 0.0) {
          vary_x = abs(cos(time)) * intensity + power;
          vary_y = abs(cos(time)) * intensity + power;
        } else if(trig == 1.0) {
          vary_x = abs(sin(time)) * intensity + power;
          vary_y = abs(sin(time)) * intensity + power;
        }

        float raw_x = distance(position.x, x_cent);
        float raw_y = distance(position.y, y_cent);

        float in_tents = sqrt(pow(vary_x, 2.0) + pow(vary_y, 2.0)) - sqrt(pow(raw_x, 2.0) + pow(raw_y,2.0));
        if(in_tents <= 0.0) {
          in_tents = 0.0;
        }

        if(col == 0.0) {
          gl_FragColor.r = in_tents * f_col[0] + gl_FragColor.r;
        } else if(col == 0.5) {
          gl_FragColor.g = in_tents * f_col[1] + gl_FragColor.g;
        } else if(col == 1.0) {
          gl_FragColor.b = in_tents * f_col[2] + gl_FragColor.b;
        }
      }
      void main() {
        // vec2 ref = position * mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
        // if (abs(ref.x - x) < 0.005)
        //   a = 1.0;
        // if (abs(ref.y - y) < 0.005)
        //   a = 1.0;
        float a = 1.0 - pow(distance(position, vec2(x, y)), 0.5);
        gl_FragColor = vec4(a, a, a, 1.0);
      }
      `);
    // this.$refs.canvas.setShader(`
    //   precision mediump float;
    //   varying vec2 position;
    //   uniform float time;
    //   uniform vec2 resolution;
    //   void splodey(float x_cent, float y_cent, float trig, float col, float power, float intensity, vec4 f_col) {
    //     float vary_x;
    //     float vary_y;
    //
    //     if(trig == 0.0) {
    //       vary_x = abs(cos(time)) * intensity + power;
    //       vary_y = abs(cos(time)) * intensity + power;
    //     } else if(trig == 1.0) {
    //       vary_x = abs(sin(time)) * intensity + power;
    //       vary_y = abs(sin(time)) * intensity + power;
    //     }
    //
    //     float raw_x = distance(position.x, x_cent) * (resolution.x / resolution.y);
    //     float raw_y = distance(position.y, y_cent);
    //
    //     float in_tents = sqrt(pow(vary_x, 2.0) + pow(vary_y, 2.0)) - sqrt(pow(raw_x, 2.0) + pow(raw_y,2.0));
    //     if(in_tents <= 0.0) {
    //       in_tents = 0.0;
    //     }
    //
    //     if(col == 0.0) {
    //       gl_FragColor.r = in_tents * f_col[0] + gl_FragColor.r;
    //     } else if(col == 0.5) {
    //       gl_FragColor.g = in_tents * f_col[1] + gl_FragColor.g;
    //     } else if(col == 1.0) {
    //       gl_FragColor.b = in_tents * f_col[2] + gl_FragColor.b;
    //     }
    //   }
    //   // makes a pseudorandom number between 0 and 1
    //   float hash(float n) {
    //     return fract(sin(n)*93942.234);
    //   }
    //   // smoothsteps a grid of random numbers at the integers
    //   float noise(vec2 p) {
    //     vec2 w = floor(p);
    //     vec2 k = fract(p);
    //     k = k*k*(3.-2.*k); // smooth it
    //
    //     float n = w.x + w.y*57.;
    //
    //     float a = hash(n);
    //     float b = hash(n+1.);
    //     float c = hash(n+57.);
    //     float d = hash(n+58.);
    //
    //     return mix(
    //       mix(a, b, k.x),
    //       mix(c, d, k.x),
    //       k.y);
    //     }
    //     // rotation matrix
    //     mat2 m = mat2(0.6,0.8,-0.8,0.6);
    //     // fractional brownian motion (i.e. photoshop clouds)
    //     float fbm(vec2 p) {
    //       float f = 0.;
    //       f += 0.5000*noise(p); p *= 2.02*m;
    //       f += 0.2500*noise(p); p *= 2.01*m;
    //       f += 0.1250*noise(p); p *= 2.03*m;
    //       f += 0.0625*noise(p);
    //       f /= 0.9375;
    //       return f;
    //     }
    //     void main() {
    //       // relative coordinates
    //
    //       gl_FragColor.r = 0.0;
    //       gl_FragColor.g = 0.0;
    //       gl_FragColor.b = 0.0;
    //
    //       vec2 p = vec2(position*6.)*vec2(resolution.x/resolution.y, 1.);
    //       float t = time * .009;
    //
    //       // calling fbm on itself
    //       vec2 a = vec2(fbm(p+t*3.), fbm(p-t*3.+8.1));
    //       vec2 b = vec2(fbm(p+t*4. + a*7. + 3.1), fbm(p-t*4. + a*7. + 91.1));
    //       float c = fbm(b*9. + t*20.);
    //
    //       // increase contrast
    //       c = smoothstep(0.15,0.98,c);
    //
    //       // mix in some color
    //       vec3 col = vec3(c);
    //       col.rb += b*0.17;
    //
    //       vec4 f_col = vec4(col, 1.);
    //
    //       gl_FragColor = f_col;
    //       gl_FragColor.r = 0.0;
    //       gl_FragColor.g = 0.0;
    //       gl_FragColor.b = 0.0;
    //       splodey(0.25, 0.75, 0.0, 0.0, abs(cos(time/5.0)) + 0.2, 0.00, f_col);
    //       splodey(0.75, 0.25, 1.0, 1.0, abs(sin(time/5.0)) + 0.2, 0.00, f_col);
    //       splodey(0.5, 0.5, 1.0, 0.5, abs(cos(time/5.0)) + 0.2, 0.00, f_col);
    //     }
    //       `);
          // var socket = window.socket = io.connect('localhost:8080');
          // socket.emit('subscribe', {address: '/muse/eeg'});
          // socket.on('/muse/eeg', (data) => {
          //   this.$refs.pc.uniforms.eeg0 = data.args[0] / 1000;
          //   this.$refs.pc.uniforms.eeg1 = data.args[1] / 1000;
          //   this.$refs.pc.uniforms.eeg2 = data.args[2] / 1000;
          //   this.$refs.pc.uniforms.eeg3 = data.args[3] / 1000;
          // });
          var socket = new WebSocket('ws://127.0.0.1:10138/myo/3?appid=io.isobit.hello');
          socket.onmessage = (msg) => {
            var data = JSON.parse(msg.data)[1];
            if (data.type == 'orientation' && data.myo == 0) {
              if (this.zeroOrientation == null) this.zeroOrientation = data.orientation;
              this.$refs.canvas.uniforms.y = (this.zeroOrientation.x - data.orientation.x) * 2.0 + 0.5;
              this.$refs.canvas.uniforms.theta = this.zeroOrientation.y - data.orientation.y;
              this.$refs.canvas.uniforms.x = (data.orientation.w - this.zeroOrientation.w) * 2.0 + 0.5;
            }
          };
        }
      }
      </script>
