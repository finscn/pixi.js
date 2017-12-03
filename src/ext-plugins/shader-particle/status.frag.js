export default `

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uStatusIn;
uniform vec2 uViewSize;

const float gravity = 0.75;

float rand(vec2 co)
{
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(co.xy ,vec2(a,b));
    float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main(void)
{
    vec4 position = texture2D(uStatusIn, vTextureCoord);
    position.xy += position.zw;
    position.w += gravity;

    if(position.y > uViewSize.y)
    {
        position.y = uViewSize.y;
        position.w *= -0.85;

        if(position.w > -20.0)
        {
            position.w = rand(vTextureCoord) * -32.0;
        }
    }

    if(position.x > uViewSize.x)
    {
        position.x = uViewSize.x;
        position.z *= -1.0;
    }

    if(position.x < 0.0)
    {
        position.x = 0.0;
        position.z *= -1.0;
    }

    gl_FragColor = position;
}

`;
