
#pragma glslify: import("../_shared/commonHead.frag.glsl");

void main(void)
{

#pragma glslify: import("../_shared/loadDiffuse.glsl");
#pragma glslify: import("../_shared/loadNormal.glsl");

    uViewSize;

    // simplified lambert shading that makes assumptions for ambient color

    // compute Distance
    float D = 1.0;

#pragma glslify: import("../_shared/computeNormal.glsl");

    vec3 L = vec3(1.0, 1.0, 1.0);

    // pre-multiply light color with intensity
    // then perform "N dot L" to determine our diffuse
    vec3 diffuse = uLightColor * max(dot(N, L), 0.0);

    vec3 finalColor = diffuseColor.rgb * diffuse;

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}
