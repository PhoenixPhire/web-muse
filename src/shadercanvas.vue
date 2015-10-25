<style lang="scss">
</style>

<template>
  <canvas v-el:canvas></canvas>
</template>

<script>
const vertexShaderSource = `
attribute vec2 vPosition;
varying vec2 position;
void main() {
  position = (vPosition + 1.0) * 0.5;
  gl_Position = vec4(vPosition, 0, 1);
}
`;
export default {
  props: ['width', 'height'],
  data() {
    return {
      uniforms: {}
    }
  },
  ready() {

    // Get webgl context
    this.gl = this.$els.canvas.getContext("webgl") || this.$els.canvas.getContext("experimental-webgl");
    if (!this.gl) {
      throw {message: "Could not get webgl context!"};
    }

    // Create gl viewport and setup buffer

    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    var buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
        1.0, -1.0,
        1.0,  1.0
      ]),
      this.gl.DYNAMIC_DRAW
    );

    this.setShader(`
      precision mediump float;
      varying vec2 position;
      uniform float time;
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
      }
      `);

    this.start_time = new Date().getTime();

    this.$els.canvas.width = this.width;
    this.$els.canvas.height = this.height;
    this.gl.viewport( 0, 0, this.$els.canvas.width, this.$els.canvas.height );

    this.animate();
  },
  methods: {
    setShader: function(fragmentShaderSource) {
      // Compile and attach shaders
      var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vertexShader, vertexShaderSource);
      this.gl.compileShader(vertexShader);
      if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(vertexShader));
        throw "Something went wrong compiling vertex shader.";
      }

      this.program = this.gl.createProgram();
      this.gl.attachShader(this.program, vertexShader);
      var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fragmentShader, fragmentShaderSource);
      this.gl.compileShader(fragmentShader);
      if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
        console.log(this.gl.getShaderInfoLog(fragmentShader));
        throw "Something went wrong compiling fragment shader.";
      }
      this.gl.attachShader(this.program, fragmentShader);
      this.gl.linkProgram(this.program);

      console.log(this.gl.getProgramInfoLog(this.program));
      this.gl.useProgram(this.program);
    },
    animate: function() {
      window.requestAnimationFrame(this.animate.bind(this), this.$els.canvas);
      this.render();
    },
    render: function() {
      this.gl.clearColor(1., 0., 0., 1.);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      var positionLocation = this.gl.getAttribLocation(this.program, "vPosition");
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

      var time = new Date().getTime() - this.start_time;
      this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'time'), time / 1000 );

      for (var key in this.uniforms) {
        if (this.uniforms.hasOwnProperty(key)) {
          this.gl.uniform1f(this.gl.getUniformLocation(this.program, key), this.uniforms[key]);
        }
      }

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    },
    pngUrl: function() {
      this.render();
      return this.$els.canvas.toDataURL('string/png');
    }
  }
}
</script>
