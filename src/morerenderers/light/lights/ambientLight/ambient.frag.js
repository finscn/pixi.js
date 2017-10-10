import commonHead from '../_shared/common-head.frag.js';
import loadDiffuse from '../_shared/load-diffuse.frag.js';
import loadNormal from '../_shared/load-normal.frag.js';
import computeNormal from '../_shared/compute-normal.frag.js';

export default `

${commonHead}

void main(void)
{

${loadDiffuse}
${loadNormal}

    uViewSize;

    // simplified lambert shading that makes assumptions for ambient color

    // compute Distance
    float D = 1.0;

${computeNormal}

    vec3 L = vec3(1.0, 1.0, 1.0);

    // pre-multiply light color with intensity
    // then perform "N dot L" to determine our diffuse
    vec3 diffuse = uLightColor * max(dot(N, L), 0.0);

    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}

`;
