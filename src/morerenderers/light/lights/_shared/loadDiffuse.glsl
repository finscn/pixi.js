    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);

    // bail out early when diffuse has no data
    if (diffuseColor.a == 0.0) {
       discard;
    }
