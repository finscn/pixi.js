
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

    // normalize vectors
    // vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
    vec3 normal3 = vec3(normalColor.xyz * 2.0 - 1.0);
    vec3 N = normalize(vec3((uWorldMatrix * vec3(normal3.xy, 0.0)).xy , normal3.z));
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
