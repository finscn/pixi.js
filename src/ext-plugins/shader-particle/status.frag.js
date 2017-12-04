export default `

precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uStatusIn;
uniform vec2 uViewSize;

const float gravity = 0.75;

void main(void)
{
    vec4 position = texture2D(uStatusIn, vTextureCoord);

    position.xy += position.zw;
    position.w += gravity;

    if(position.y > uViewSize.y)
    {
        position.y = uViewSize.y;
        if(position.w > 25.0)
        {
            position.w = 25.0;
        }
        position.w *= -1.0;
    }

    if(position.x > uViewSize.x)
    {
        position.x = uViewSize.x;
        position.z *= -1.0;
    }
    else if(position.x < 0.0)
    {
        position.x = 0.0;
        position.z *= -1.0;
    }

    gl_FragColor = position;
}

`;
