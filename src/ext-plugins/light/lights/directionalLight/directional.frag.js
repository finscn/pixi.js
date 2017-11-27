import commonHead from '../_shared/common-head.frag.js';
import loadDiffuse from '../_shared/load-diffuse.frag.js';
import loadNormal from '../_shared/load-normal.frag.js';
import computeNormal from '../_shared/compute-normal.frag.js';

export default `

// imports the common uniforms like samplers, and ambient/light color
${commonHead}

uniform vec3 uAmbientColor;
uniform vec3 uLightDirection;

void main()
{

${loadDiffuse}
${loadNormal}

    // the directional vector of the light
    vec3 lightVector = uLightDirection;

    // correct for aspect ratio
    lightVector.y *= uViewSize.y / uViewSize.x;

    // compute Distance
    // float D = length(lightVector);

${computeNormal}

    vec3 L = normalize(lightVector);

    // pre-multiply light color with intensity
    // then perform "N dot L" to determine our diffuse
    vec3 diffuse = uLightColor * max(dot(N, L), 0.0);

    // calculate attenuation
    float attenuation = 1.0;

    // calculate final intesity and color, then combine
    vec3 intensity = uAmbientColor + diffuse * attenuation;

    vec3 finalColor = diffuseColor.rgb * intensity;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}

`;
