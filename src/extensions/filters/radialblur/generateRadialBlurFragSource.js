const GAUSSIAN_VALUES = {
    5: [0.153388, 0.221461, 0.250301],
    7: [0.071303, 0.131514, 0.189879, 0.214607],
    9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
    11: [0.0093, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
    13: [0.002406, 0.009255, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
    15: [0.000489, 0.002403, 0.009246, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448],
};

const fragTemplate = [

    'uniform sampler2D uSampler;',
    'varying vec2 vTextureCoord;',

    'uniform float strength;',
    'uniform vec2 centerCoord;',
    'uniform float minRadius;',
    'uniform float aspect;',

    'void main(void)',
    '{',
    '  float dis = distance( vec2(vTextureCoord.x, vTextureCoord.y / aspect), centerCoord);',
    '  float disStrength;',
    '  if (dis < minRadius) {',
    '    disStrength = 0.0;',
    '  } else {',
    '    disStrength = strength * (dis - minRadius) / 1.0;',
    '  }',
    '  gl_FragColor = vec4(0.0);',
    '  %blur%',
    '}',

].join('\n');

export default function generateRadialBlurFragSource(kernelSize, horizontal)
{

    const kernel = GAUSSIAN_VALUES[kernelSize];
    const halfLength = kernel.length;

    let fragSource = fragTemplate;


    let blurLoop = '';
    let template;
    if (horizontal) {
        template = 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2( %sampleIndex% * disStrength, 0.0)) * %value%;';
    } else {
        template = 'gl_FragColor += texture2D(uSampler, vTextureCoord + vec2(0.0, %sampleIndex% * disStrength)) * %value%;';
    }
    let value;

    for (let i = 0; i < kernelSize; i++)
    {
        let blur = template.replace('%index%', i);

        value = i;

        if (i >= halfLength)
        {
            value = kernelSize - i - 1;
        }

        blur = blur.replace('%value%', kernel[value]);

        blur = blur.replace('%sampleIndex%', `${i - (halfLength - 1)}.0`);

        blurLoop += blur;
        blurLoop += '\n';
    }

    fragSource = fragSource.replace('%blur%', blurLoop);

    return fragSource;
}
