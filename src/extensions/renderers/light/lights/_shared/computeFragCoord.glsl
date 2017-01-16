    vec2 fragCoord = gl_FragCoord.xy / uViewSize;

    if (flippedY > 0.0)
    {
        // FBOs positions are flipped.
        fragCoord.y = 1.0 - fragCoord.y;
    }
