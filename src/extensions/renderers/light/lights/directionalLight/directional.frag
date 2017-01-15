precision lowp float;

// imports the common uniforms like samplers, and ambient/light color
#pragma glslify: import("../_shared/commonHead.frag.glsl")

uniform vec3 uAmbientColor;
uniform vec3 uLightDirection;

void main()
{

#pragma glslify: import("../_shared/loadNormals.glsl");

    // the directional vector of the light
    vec3 lightVector = uLightDirection;

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    // float D = length(lightVector);

#pragma glslify: import("../_shared/computeDiffuse.glsl");

    // calculate attenuation
    float attenuation = 1.0;

    // calculate final intesity and color, then combine
    vec3 intensity = uAmbientColor + diffuse * attenuation;
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    vec3 finalColor = diffuseColor.rgb * intensity;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
