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

    vec3 colorA = vec3(0.149,0.141,0.912);
    vec3 colorB = vec3(1.000,0.833,0.224);

    float plot(vec2 st, float x) {
      return smoothstep(x - 0.01, x, st.y) - smoothstep(x, x + 0.01, st.y);
    }

    void main () {
      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      vec3 color = vec3(0.0);
      vec3 pct = vec3(st.x);

      pct.r = smoothstep(0.0,1.0, st.x);
      pct.g = sin(st.x*PI);
      pct.b = pow(st.x,0.5);

      color = mix(colorA, colorB, pct);

      color = mix(color,vec3(1.0,0.0,0.0),plot(st,pct.r));
      color = mix(color,vec3(0.0,1.0,0.0),plot(st,pct.g));
      color = mix(color,vec3(0.0,0.0,1.0),plot(st,pct.b));

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
      regl.clear({
        color: [0, 0, 0, 1]
      })
      drawQuad()
    };
  }, settings);
};
