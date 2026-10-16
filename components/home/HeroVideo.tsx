"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";

/**
 * Vidéo pilotée par le défilement : la progression de la section devient la
 * tête de lecture. Le plan occupe la place qu'occupait la cloche 3D — calé à
 * droite en paysage, centré et plus petit en portrait.
 *
 * Deux partis pris :
 *
 * 1. La vidéo n'est jamais *jouée*, on pose `currentTime` nous-mêmes. C'est ce
 *    qui permet de revenir en arrière quand l'utilisateur remonte, ce qu'un
 *    `play()` synchronisé ne sait pas faire.
 *
 * 2. Le plan est tourné sur fond de studio, et le MP4 ne sait pas transporter
 *    de couche alpha. Le détourage est donc fait HORS LIGNE (voir le script de
 *    matting) et le résultat livré empilé dans une seule vidéo : l'image
 *    détourée en haut, son masque d'opacité en bas — d'où une source deux fois
 *    plus haute que ce qu'on affiche. Le shader ne fait plus que rassembler les
 *    deux moitiés.
 *
 *    C'est ce qui remplace l'incrustation temps réel qu'on faisait avant :
 *    aucun seuil de couleur ne peut distinguer un reflet spéculaire sur le pain
 *    du fond de studio, les deux étant clairs et désaturés. Hors ligne, la
 *    séparation est topologique — le fond est ce qui est relié au bord de
 *    l'image — donc un reflet enclavé n'est jamais percé, par construction.
 *
 * L'image est stockée en alpha prémultiplié : le fond y est noir, ce qui ne
 * coûte plus de bitrate, et l'interpolation bilinéaire du GPU y est exacte.
 * Corollaire utile : sans WebGL, afficher la moitié haute telle quelle sur le
 * fond nuit du site donne déjà le bon rendu, à un cheveu près.
 */

type Props = {
  progress: MotionValue<number>;
  /** Fenêtre de la progression globale exploitée par la vidéo. */
  from?: number;
  to?: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

/*
 * La texture est chargée avec `UNPACK_FLIP_Y_WEBGL`, donc v=1 correspond à la
 * première ligne de la source : l'image occupe la moitié haute de l'espace de
 * texture, le masque la moitié basse.
 */
const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
void main() {
  vec3 rgb = texture2D(u_tex, vec2(v_uv.x, 0.5 + v_uv.y * 0.5)).rgb;
  float a = texture2D(u_tex, vec2(v_uv.x, v_uv.y * 0.5)).r;
  gl_FragColor = vec4(rgb, a); // déjà prémultiplié à l'encodage
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/** Prépare le programme de composition ; renvoie le « dessine une frame ». */
function setupCompositor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !program) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // Un simple triangle plein cadre : deux fois moins de sommets qu'un quad et
  // pas de couture au milieu.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // La vidéo n'est pas en puissance de deux : mipmaps et `REPEAT` interdits.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return () => {
    const w = video.videoWidth;
    // Seule la moitié haute est affichée : le canvas fait la taille de l'image,
    // pas celle de la source empilée.
    const h = video.videoHeight / 2;
    if (!w || !h) return false;
    if (canvas.width !== w) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  };
}

/* -------------------------------------------------------------------------- */

export function HeroVideo({ progress, from = 0.04, to = 0.82 }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [composited, setComposited] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const draw = setupCompositor(canvas, video);
    if (!draw) setComposited(false);

    let raf = 0;
    // Position lissée : on n'applique pas la valeur brute du scroll, sinon
    // chaque cran de molette fait un saut. On glisse vers la cible à chaque
    // frame, ce qui donne l'inertie d'un travelling.
    let current = 0;
    let seeking = false;
    let dirty = true;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      if (dirty && video.readyState >= 2) {
        dirty = false;
        if (!draw || draw()) setReady(true);
      }

      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;

      const target = clamp01((progress.get() - from) / (to - from)) * duration;
      current += (target - current) * 0.12;

      // Un `seek` en cours ignore silencieusement les suivants : on attend que
      // le décodeur ait rendu la frame avant d'en demander une autre, sinon on
      // sature la file et l'image se fige.
      if (seeking || Math.abs(video.currentTime - current) < 0.02) return;
      seeking = true;
      video.currentTime = current;
    };

    const onMeta = () => {
      current = 0;
      video.currentTime = 0;
      dirty = true;
    };

    const onFrame = () => {
      seeking = false;
      dirty = true;
    };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onFrame);
    video.addEventListener("seeked", onFrame);
    if (video.readyState >= 1) onMeta();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onFrame);
      video.removeEventListener("seeked", onFrame);
    };
  }, [progress, from, to]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center md:justify-end md:pr-[4vw]"
    >
      <div
        className="relative aspect-square w-[88vw] max-w-[520px] translate-y-6 md:w-[46vw] md:max-w-[700px] md:translate-y-2"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 900ms ease-out" }}
      >
        {/* Le foyer derrière le sujet : sans lui, le burger détouré flotte sans
            se poser dans la scène. */}
        <span
          className="absolute inset-[8%] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,90,31,0.34) 0%, rgba(255,179,71,0.12) 45%, transparent 70%)",
          }}
        />

        {/* Sans WebGL : on recadre sur la moitié haute, déjà prémultipliée sur
            du noir, ce qui se fond dans le fond nuit sans masque. */}
        <div className={composited ? "contents" : "relative h-full w-full overflow-hidden"}>
          <video
            ref={videoRef}
            src="/burger.mp4"
            muted
            playsInline
            preload="auto"
            // Sans `disableRemotePlayback`, Safari propose AirPlay sur une
            // vidéo purement décorative.
            disableRemotePlayback
            tabIndex={-1}
            className={
              composited
                ? "pointer-events-none absolute h-px w-px opacity-0"
                : "absolute inset-x-0 top-0 h-[200%] w-full object-cover object-top"
            }
          />
        </div>

        {composited && (
          <canvas
            ref={canvasRef}
            className="relative h-full w-full object-contain"
            style={{ filter: "drop-shadow(0 24px 46px rgba(0,0,0,0.55))" }}
          />
        )}
      </div>
    </div>
  );
}
