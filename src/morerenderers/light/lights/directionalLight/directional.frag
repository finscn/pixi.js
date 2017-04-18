
// imports the common uniforms like samplers, and ambient/light color
#pragma glslify: import("../_shared/commonHead.frag.glsl")

uniform vec3 uAmbientColor;
uniform vec3 uLightDirection;

void main()
{

#pragma glslify: import("../_shared/loadDiffuse.glsl");
#pragma glslify: import("../_shared/loadNormal.glsl");

    // the directional vector of the light
    vec3 lightVector = uLightDirection;

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    // float D = length(lightVector);

#pragma glslify: import("../_shared/computeNormal.glsl");

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
