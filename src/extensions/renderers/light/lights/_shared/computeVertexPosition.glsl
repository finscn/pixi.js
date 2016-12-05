    vec2 texCoord = gl_FragCoord.xy / uViewSize;

    // FBOs positions are flipped.
    texCoord.y = 1.0 - texCoord.y;
