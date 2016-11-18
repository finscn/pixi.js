    vec4 normalColor = texture2D(uNormalSampler, texCoord);

    // Green layer is flipped Y coords.
    normalColor.g = 1.0 - normalColor.g;

    // bail out early when normal has no data
    if (normalColor.a == 0.0) discard;

