import commonHead from '../_shared/common-head.frag.js';
import loadDiffuse from '../_shared/load-diffuse.frag.js';
import loadNormal from '../_shared/load-normal.frag.js';
import computeNormal from '../_shared/compute-normal.frag.js';

export default `

// imports the common uniforms like samplers, and ambient color
${commonHead}

varying float flippedY;

uniform vec3 uAmbientColor;
uniform vec3 uLightPosition;
uniform float uLightRadius;

void main()
{

${loadDiffuse}
${loadNormal}

    vec2 fragCoord = gl_FragCoord.xy / uViewSize.xy;

    // FBOs positions are flipped.
    fragCoord.y = flippedY > 0.0 ? 1.0 - fragCoord.y : fragCoord.y;

    vec3 lightPosition = uLightPosition / vec3(uViewSize, uViewSize.x);
    float lightRadius = uLightRadius / uViewSize.x;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition.xy - fragCoord, lightPosition.z);

    // correct for aspect ratio
    lightVector.y *= uViewSize.y / uViewSize.x;

    // compute Distance
    float D = length(lightVector);

    vec3 intensity = uAmbientColor;
    // bail out early when pixel outside of light sphere
    if (D <= lightRadius) {

${computeNormal}

        // vec3 L = normalize(lightVector);
        vec3 L = lightVector / D;

        // pre-multiply light color with intensity
        // then perform N dot L to determine our diffuse
        vec3 diffuse = uLightColor * max(dot(N, L), 0.0);

        // calculate attenuation
        float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

        // calculate final intesity and color, then combine
        intensity += diffuse * attenuation;
    }

    // TODO : roughness
    // TODO : finalColor = ambient + diffuse + specular

    vec3 finalColor = diffuseColor.rgb * intensity;
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}

`;
