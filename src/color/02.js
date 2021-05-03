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
    #define TWO_PI 6.28318530718

    uniform float u_time;
    uniform vec2 u_resolution;
    varying vec2 uv;


    vec3 hsb2rgb( in vec3 c ){
      vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                              6.0)-3.0)-1.0,
                      0.0,
                      1.0 );
      rgb = rgb*rgb*(3.0-2.0*rgb);
      return c.z * mix( vec3(1.0), rgb, c.y);
    }

    void main () {
      vec2 st = uv;
      vec3 color = vec3(0.0);

      vec2 toCenter = vec2(0.5)-st;
      float rotation = u_time;
      float radius = length(toCenter)*2.0;
      float angle = atan(toCenter.y,toCenter.x) + rotation;
      angle += radius;
      angle -= mod(angle, (TWO_PI / 6.0));

      color = hsb2rgb(vec3((angle/TWO_PI)+0.5,1.0,1.0));

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
      regl.poll()
      regl.clear({
        color: [0, 0, 0, 1]
      })
      drawQuad()
    };
  }, settings);
};
