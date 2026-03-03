import { useEffect, useRef, useState } from 'react';

// --- WebGL Shaders ---
const VERT_SRC = `
  attribute vec2 a_pos;
  attribute vec2 a_uv;
  varying vec2 v_uv;
  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG_SRC = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_video;
  uniform sampler2D u_lut;
  uniform float u_size;
  uniform float u_mix;

  vec3 applyLUT(vec3 color) {
    float size = u_size;
    float blue = color.b * (size - 1.0);
    float z0 = floor(blue);
    float z1 = min(z0 + 1.0, size - 1.0);
    float zf = blue - z0;

    vec2 lutSize = vec2(size * size, size);

    vec2 uv0 = (vec2(color.r * (size - 1.0) + z0 * size,
                     color.g * (size - 1.0)) + 0.5) / lutSize;
    vec2 uv1 = (vec2(color.r * (size - 1.0) + z1 * size,
                     color.g * (size - 1.0)) + 0.5) / lutSize;

    vec3 c0 = texture2D(u_lut, uv0).rgb;
    vec3 c1 = texture2D(u_lut, uv1).rgb;
    return mix(c0, c1, zf);
  }

  void main() {
    // Flip Y for WebGL convention
    vec3 orig = texture2D(u_video, vec2(v_uv.x, 1.0 - v_uv.y)).rgb;
    vec3 col = applyLUT(orig);
    vec3 outCol = mix(orig, col, u_mix);
    gl_FragColor = vec4(outCol, 1.0);
  }
`;

function createShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error:", gl.getShaderInfoLog(sh));
        return null;
    }
    return sh;
}

function createProgram(gl, vsSrc, fsSrc) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("Program Link Error:", gl.getProgramInfoLog(prog));
        return null;
    }
    return prog;
}

function cubeTo2D(lut) {
    const { size, data } = lut;
    const width = size * size;
    const height = size;
    const pixels = new Uint8Array(width * height * 3);

    for (let r = 0; r < size; r++) {
        for (let g = 0; g < size; g++) {
            for (let b = 0; b < size; b++) {
                const src = ((r * size + g) * size + b) * 3;
                const x = r + b * size;
                const y = g;
                const dst = (y * width + x) * 3;
                pixels[dst] = Math.max(0, Math.min(255, Math.round(data[src] * 255)));
                pixels[dst + 1] = Math.max(0, Math.min(255, Math.round(data[src + 1] * 255)));
                pixels[dst + 2] = Math.max(0, Math.min(255, Math.round(data[src + 2] * 255)));
            }
        }
    }
    return { width, height, pixels };
}

export function parseCube(text) {
    const lines = text.split(/\r?\n/);
    let size = 0;
    const values = [];
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        if (line.startsWith("LUT_3D_SIZE")) {
            size = parseInt(line.split(/\s+/)[1], 10);
            continue;
        }
        if (line.startsWith("DOMAIN_MIN") || line.startsWith("DOMAIN_MAX") || line.startsWith("TITLE")) {
            continue;
        }
        const parts = line.split(/\s+/).map(Number);
        if (parts.length === 3 && parts.every(n => Number.isFinite(n))) {
            values.push(parts[0], parts[1], parts[2]);
        }
    }
    if (!size) size = Math.round(Math.cbrt(values.length / 3));
    return { size, data: new Float32Array(values) };
}

export default function useLutFilter(videoRef, canvasRef) {
    const glRef = useRef(null);
    const coreRef = useRef(null);
    const rafRef = useRef(null);
    const [isLutActive, setIsLutActive] = useState(false);
    const [lutIntensity, setLutIntensity] = useState(1.0);

    useEffect(() => {
        // Initialize WebGL context and shaders for LUT processing
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }
        glRef.current = gl;

        const program = createProgram(gl, VERT_SRC, FRAG_SRC);
        if (!program) return;

        const aPos = gl.getAttribLocation(program, "a_pos");
        const aUv = gl.getAttribLocation(program, "a_uv");
        const uVideo = gl.getUniformLocation(program, "u_video");
        const uLut = gl.getUniformLocation(program, "u_lut");
        const uSize = gl.getUniformLocation(program, "u_size");
        const uMix = gl.getUniformLocation(program, "u_mix");

        // Standard fullscreen quad
        const quad = new Float32Array([
            -1, -1, 0, 0,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            1, 1, 1, 1,
        ]);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const videoTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, videoTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const lutTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, lutTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        coreRef.current = {
            gl, program, aPos, aUv, uVideo, uLut, uSize, uMix, buf, videoTex, lutTex, lutSize: 0, currentMix: 1.0
        };

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (gl) {
                gl.deleteProgram(program);
                gl.deleteBuffer(buf);
                gl.deleteTexture(videoTex);
                gl.deleteTexture(lutTex);
            }
        };
    }, [canvasRef, videoRef]);

    // Sync intensity
    useEffect(() => {
        if (coreRef.current) {
            coreRef.current.currentMix = lutIntensity;
        }
    }, [lutIntensity]);

    // Main render loop
    useEffect(() => {
        if (!coreRef.current) return;
        const core = coreRef.current;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const gl = core.gl;

        const render = () => {
            // Only render if video is playing and we have a LUT
            if (video.readyState >= 2 && core.lutSize > 0 && isLutActive) {
                const vw = video.videoWidth;
                const vh = video.videoHeight;

                // Sync canvas size to video resolution
                if (vw && vh && (canvas.width !== vw || canvas.height !== vh)) {
                    canvas.width = vw;
                    canvas.height = vh;
                    gl.viewport(0, 0, vw, vh);
                }

                gl.useProgram(core.program);

                gl.bindBuffer(gl.ARRAY_BUFFER, core.buf);
                gl.enableVertexAttribArray(core.aPos);
                gl.vertexAttribPointer(core.aPos, 2, gl.FLOAT, false, 16, 0);
                gl.enableVertexAttribArray(core.aUv);
                gl.vertexAttribPointer(core.aUv, 2, gl.FLOAT, false, 16, 8);

                // Upload new video frame
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, core.videoTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
                gl.uniform1i(core.uVideo, 0);

                // Bind LUT texture
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, core.lutTex);
                gl.uniform1i(core.uLut, 1);

                gl.uniform1f(core.uSize, core.lutSize);
                gl.uniform1f(core.uMix, core.currentMix);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            rafRef.current = requestAnimationFrame(render);
        };

        rafRef.current = requestAnimationFrame(render);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [videoRef, canvasRef, isLutActive]);

    const applyLut = (lutData) => {
        if (!coreRef.current) return;
        const core = coreRef.current;
        const gl = core.gl;

        if (!lutData) {
            setIsLutActive(false);
            core.lutSize = 0;
            return;
        }

        try {
            const tex2d = cubeTo2D(lutData);
            core.lutSize = lutData.size;

            gl.bindTexture(gl.TEXTURE_2D, core.lutTex);
            gl.texImage2D(
                gl.TEXTURE_2D, 0, gl.RGB,
                tex2d.width, tex2d.height, 0,
                gl.RGB, gl.UNSIGNED_BYTE, tex2d.pixels
            );

            setIsLutActive(true);
        } catch (err) {
            console.error("Failed to apply LUT texture:", err);
            setIsLutActive(false);
        }
    };

    return {
        applyLut,
        setLutIntensity,
        isLutActive,
        lutIntensity
    };
}
