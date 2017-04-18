    // normalize vectors
    vec3 N;
    if (uFixedNormal) {
        N = normalize(normalColor.xyz * 2.0 - 1.0);
    } else {
        vec3 normal3 = vec3(normalColor.xyz * 2.0 - 1.0);
        N = normalize(vec3((uWorldMatrix * vec3(normal3.xy, 0.0)).xy , normal3.z));
    }