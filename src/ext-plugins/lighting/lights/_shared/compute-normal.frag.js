export default `

// normalize vectors
vec3 normal3 = vec3(normalColor.xyz * 2.0 - 1.0);
vec3 N = normalize(
        uFixedNormal ?
            normal3 :
            vec3((uWorldMatrix * vec3(normal3.xy, 0.0)).xy , normal3.z)
    );

`;
