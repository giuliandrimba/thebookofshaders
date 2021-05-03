const sketch = require("canvas-sketch");
const createRegl = require('regl');
const glsl = require('glslify');

const settings = {
  context: 'webgl',
  dimensions: 'a4',
  animate: true,
  fps: 24,
};

window.onload = () => {

  const frag = glsl(`
    #ifdef GL_ES
    precision mediump float;
    #endif

    #define PI 3.14159265359

    uniform float time;
    varying vec2 uv;

    float plot(vec2 st, float x) {
      return smoothstep(x - 0.01, x, st.y) - smoothstep(x, x + 0.01, st.y);
    }

    void main () {
      float x = abs(uv.x * 2.0 - 1.0);

      // float p = 1.0 - pow(x, 2.0);
      float p = 1.0 - pow(x + time * 0.1, 2.0);

      vec3 color = vec3(x);
      vec3 green = vec3(0.0, 1.0, 0.0);

      float line = plot(uv, p);

      color = mix(color, green, line);

      gl_FragColor = vec4(color, 1.0);
    }
  `);

  const vert = glsl(`
    precision mediump float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(2.0 * position - 1.0, 0, 1);
    }
  `);

  sketch(({ gl }) => {
    const regl = createRegl({ gl });

    const drawQuad = regl({
      frag,
      vert,
      attributes: {
        position: [
          0, 0,
          0, 1,
          1, 1,
          1, 0,
          0, 0,
          1, 1
        ]
      },
      uniforms: {
        time: ({tick}) => 0.01 * tick
      },
      count: 6
    })

    return () => {
      regl.clear({
        color: [0, 0, 0, 1]
      })
      drawQuad()
    };
  }, settings);
};
