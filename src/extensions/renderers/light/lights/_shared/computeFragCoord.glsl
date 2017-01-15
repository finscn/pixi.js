    vec2 fragCoord = gl_FragCoord.xy / uViewSize;

    // FBOs positions are flipped.
    fragCoord.y = 1.0 - fragCoord.y;
