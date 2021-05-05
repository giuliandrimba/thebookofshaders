const sketch = require("canvas-sketch");
const createRegl = require('regl');
const glsl = require('glslify');

const settings = {
  context: 'webgl',
  dimensions: 'a4',
  orientation: 'landscape',
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
      vec2 rSize = vec2(size.x, size.y * (u_resolution.x / u_resolution.y));
      vec2 borders = step(vec2(pos),st);
      float pct = borders.x * borders.y;

      vec2 tr = step(vec2(1.0) - (pos + rSize), 1.0 - st);
      pct *= tr.x * tr.y;

      return pct;
    }

    float circle(vec2 pos, float radius, vec2 st) {
      vec2 rRadius = vec2(0.1, radius);
      float pct = 0.0;
      float ci = step(radius, distance(vec2(st.x * (u_resolution.x / u_resolution.y), st.y),vec2(pos.x* (u_resolution.x / u_resolution.y), pos.y)) / radius);
      pct = 1.0 - ci;
      return pct;
    }

    void main () {
      vec2 st = gl_FragCoord.xy/u_resolution;
      float drawCircle = max(circle(vec2(0.1), 0.5, st), circle(vec2(0.2), 0.5, st));
      vec3 red = vec3(1.0, 0.0, 0.0);
      vec3 color = vec3(drawCircle * red);
      // color += rect(vec2(0.5), vec2( 0.2), st);
      gl_FragColor = vec4( color, 1.0 );
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
