#define GLSLIFY 1
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uCenter;
uniform float uRadius;
uniform vec3 uFalloff;
uniform float uTime;
uniform vec2 uViewSize;

void main()
{
    vec2 texCoord = gl_FragCoord.xy / uViewSize;
    texCoord.y = 1.0 - texCoord.y;

    vec2 uv = vTextureCoord;

    vec2 center = uCenter / uViewSize;
    float radius = uRadius / uViewSize.y;

    vec2 vector = vec2(texCoord - center);
    vector.x *= uViewSize.x / uViewSize.y;
    float dist = length(vector);

    if (dist < radius && dist <= (uTime + uFalloff.z) && dist >= (uTime - uFalloff.z))
    {
        float diff = (dist - uTime);
        float powDiff = 1.0 - pow(abs(diff * uFalloff.x), uFalloff.y);
        float diffTime = diff * powDiff;
        vec2 diffUV = normalize(vector);
        uv = uv + (diffUV * diffTime);
    }
    gl_FragColor = texture2D(uSampler, uv);
}
