const sketch = require("canvas-sketch");
const createRegl = require('regl');
const glsl = require('glslify');
const createQuad = require('primitive-quad');

const settings = {
  context: 'webgl',
  dimensions: 'a4',
  animate: true,
  fps: 24,
};

window.onload = () => {

  const quad = createQuad();

  const frag = glsl(`
    precision highp float;
    uniform float time;
    varying vec2 uv;
    void main () {
      vec3 color = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0.0, 2.0, 4.0));
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
