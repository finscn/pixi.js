export default `

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float epsilon;
uniform vec3 originalColors[%colorCount%];
uniform vec3 targetColors[%colorCount%];

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);

    color.rgb /= max(color.a, 0.0000000001);

    for(int i = 0; i < %colorCount%; i++)
    {
      vec3 origColor = originalColors[i];
      vec3 colorDiff = origColor - color.rgb;
      if (length(colorDiff) < epsilon) {
        vec3 targetColor = targetColors[i];
        gl_FragColor = vec4((targetColor + colorDiff) * color.a ,color.a);
        return;
      }
    }

    color.rgb *= color.a;
    gl_FragColor = color;
}

`;
