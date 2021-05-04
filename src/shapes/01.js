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

    uniform float u_time;
    uniform vec2 u_resolution;
    varying vec2 uv;

    float rect(vec2 pos, vec2 size, vec2 st) {
      vec2 borders = step(vec2(pos),st);
      float pct = borders.x * borders.y;

      vec2 tr = step(vec2(1.0) - (pos + size), 1.0 - st);
      pct *= tr.x * tr.y;

      return pct;
    }

    void main () {
      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      vec3 color = vec3(0.0);

      color = vec3( rect(vec2(0.01), vec2(0.5), st) );
      color += vec3( rect(vec2(0.6), vec2(0.2), st) );
      color += vec3( rect(vec2(0.0 + sin(u_time), 0.6), vec2(0.4), st) );

      gl_FragColor = vec4(color,1.0);
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

  sketch(({ gl, width, height }) => {
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
        u_time: ({tick}) => 0.01 * tick,
        u_resolution: () => [width, height]
      },
      count: 6
    })

    return () => {
      regl.poll();
      regl.clear({
        color: [0, 0, 0, 1]
      })
      drawQuad()
    };
  }, settings);
};
