    vec4 normalColor = texture2D(uNormalSampler, vNormalTextureCoord);

    // Green layer is flipped Y coords.
    normalColor.g = 1.0 - normalColor.g;

    // Red layer is flipped X coords.
    // normalColor.r = 1.0 - normalColor.r;

    // bail out early when normal has no data
    if (normalColor.a == 0.0) {
        discard;
    }

