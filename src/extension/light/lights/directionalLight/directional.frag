precision lowp float;

// imports the common uniforms like samplers, and ambient/light color
#pragma glslify: import("../_shared/commonUniforms.glsl")

uniform vec2 uLightDirection;
uniform vec4 uAmbientLightColor;

void main()
{
#pragma glslify: import("../_shared/computeVertexPosition.glsl");
#pragma glslify: import("../_shared/loadNormals.glsl");

    // the directional vector of the light
    vec3 lightVector = vec3(uLightDirection, uLightHeight);

    // compute Distance
    // float D = length(lightVector);

#pragma glslify: import("../_shared/computeDiffuse.glsl");

    // calculate attenuation
    float attenuation = 1.0;

    // calculate final intesity and color, then combine
    vec3 intensity = (uAmbientLightColor.rgb * uAmbientLightColor.a) + diffuse * attenuation;
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    vec3 finalColor = diffuseColor.rgb * intensity;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
