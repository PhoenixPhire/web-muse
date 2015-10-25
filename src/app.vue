<style lang="scss">
body {
  background-color: #222;
  color: white;
  font-family: sans-serif;
  text-align: center;
}
nav {
  margin: 0 auto;
  width: 50%;
  a {
    cursor: pointer;
    display: inline-block;
    margin: 0 0.3em;
    padding: 0.3em;
  }
}
</style>

<template>
  <nav>
    <a @click="cId = 'shader'">Shader</a>
    <a @click="cId = 'graph'">Graph</a>
    <a @click="cId = 'graph2'">Graph2</a>
  </nav>
  <component :is="cId"></component>
</template>

<script>
import Shader from './shader.vue';
import Graph from './graph.vue';
import Graph2 from './graph2.vue';
export default {
  components: {
    shader: Shader,
    graph: Graph,
    graph2: Graph2
  },
  data() {
    return {
      cId: 'shader'
    }
  }
}
</script>
