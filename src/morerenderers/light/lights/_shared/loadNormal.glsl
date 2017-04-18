    vec4 normalColor = texture2D(uNormalSampler, vNormalTextureCoord);

    // Red layer is X coords.
    // normalColor.r = 1.0 - normalColor.r;

    // Green layer is flipped Y coords.
    normalColor.g = 1.0 - normalColor.g;
