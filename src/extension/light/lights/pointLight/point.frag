precision lowp float;

// imports the common uniforms like samplers, and ambient color
#pragma glslify: import("../_shared/commonUniforms.glsl");

uniform vec4 uAmbientLightColor;
uniform float uLightRadius;
uniform vec2 uLightPosition;

void main()
{
#pragma glslify: import("../_shared/computeVertexPosition.glsl");
#pragma glslify: import("../_shared/loadNormals.glsl");

    vec2 lightPosition = uLightPosition / uViewSize;

    // the directional vector of the light
    vec3 lightVector = vec3(lightPosition - texCoord, uLightHeight);

    // correct for aspect ratio
    lightVector.x *= uViewSize.x / uViewSize.y;

    // compute Distance
    float dis = length(lightVector.xy);
    float lightRadius = uLightRadius / uViewSize.y;
    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);
    vec3 intensity = uAmbientLightColor.rgb * uAmbientLightColor.a;
    // bail out early when pixel outside of light sphere
    if (dis <= lightRadius) {

        float D = length(lightVector);

        // normalize vectors
        vec3 N = normalize(normalColor.xyz * 2.0 - 1.0);
        vec3 L = normalize(lightVector);

        // pre-multiply light color with intensity
        // then perform N dot L to determine our diffuse
        vec3 diffuse = (uLightColor.rgb * uLightColor.a) * max(dot(N, L), 0.0);

        // calculate attenuation
        float attenuation = 1.0 / (uLightFalloff.x + (uLightFalloff.y * D) + (uLightFalloff.z * D * D));

        // calculate final intesity and color, then combine
        intensity += diffuse * attenuation;
    }

    vec3 finalColor = diffuseColor.rgb * intensity;
    gl_FragColor = vec4(finalColor, diffuseColor.a);
}