export default `

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float range;
uniform vec3 sourceColors[%colorCount%];
uniform vec3 targetColors[%colorCount%];

bool inRange( float c1, float c2 ) {
  return abs( c1 - c2 ) <= range;
}

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);
    if (c.a < 0.005) {
      gl_FragColor = c;
      return;
    }

    if (c.a < 0.995) {
      c.rgb /= c.a ;
    }

    for(int i = 0; i < %colorCount%; i++)
    {
      vec3 sc = sourceColors[i];
      if (inRange(c.r, sc.r) && inRange(c.g, sc.g) && inRange(c.b, sc.b)){
        vec3 tc = targetColors[i];
        c.r = tc.r;
        c.g = tc.g;
        c.b = tc.b;
        break;
      }
    }

    if (c.a < 0.995) {
      c.rgb *= c.a;
    }

    gl_FragColor = c;
}

`;
