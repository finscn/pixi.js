
// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../_shared/commonHead.frag.glsl");

varying float flippedY;

uniform vec3 uAmbientColor;
uniform vec3 uLightPosition;
uniform float uLightRadius;


void main()
{

#pragma glslify: import("../_shared/loadDiffuse.glsl");
#pragma glslify: import("../_shared/loadNormal.glsl");

    vec2 fragCoord = gl_FragCoord.xy / uViewSize;

    if (flippedY > 0.0)
    {
        // FBOs positions are flipped.
        fragCoord.y = 1.0 - fragCoord.y;
    }

    vec3 lightPosition = uLightPosition / vec3(uViewSize, uViewSize.y);
    float lightRadius = uLightRadius / uViewSize.y;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition.xy - fragCoord, lightPosition.z);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float D = length(lightVector);

    vec3 intensity = uAmbientColor;
    // bail out early when pixel outside of light sphere
    if (D <= lightRadius) {

#pragma glslify: import("../_shared/computeNormal.glsl");

        vec3 L = normalize(lightVector);

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