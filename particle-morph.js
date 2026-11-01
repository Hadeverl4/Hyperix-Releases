"use strict";(function(){"use strict";const W=document.getElementById("webgl-canvas");if(!W)return;const h=window.THREE,Me=(()=>{try{const e=document.createElement("canvas");return!!(e.getContext("webgl")||e.getContext("experimental-webgl"))}catch{return!1}})();if(!h||!Me){W.style.display="none";return}const G=window.matchMedia("(prefers-reduced-motion: reduce)").matches,I=window.innerWidth<768,re={galaxy:0}[document.documentElement.dataset.hxParticles],H=re!==void 0,x=H?I?5e3:9e3:I?7e3:(navigator.hardwareConcurrency||8)<=4?11e3:18e3,T=8,be=["features","content-sources","content-policy","available-platforms","p2p-preview","changelog","contributors"].map(e=>document.getElementById(e)),t=(()=>{let e=49734321;return()=>(e=e*1664525+1013904223>>>0)/4294967296})(),w=e=>new h.Color(e),P=(e,s,c)=>e.clone().lerp(s,c);function xe(e,s){const n=Array.from({length:9},()=>{const u=t()*2-1,m=t()*Math.PI*2,f=Math.sqrt(1-u*u);return new h.Vector3(f*Math.cos(m),u,f*Math.sin(m))}),i=[];for(let u=0;u<n.length;u++)i.push([u,(u+1+Math.floor(t()*3))%n.length]);const l=w("#0f766e"),o=w("#38bdf8"),a=w("#4ade80"),p=w("#ecfdf5"),r=new h.Vector3;for(let u=0;u<x;u++){const m=t();let f;if(m<.62){const d=u+.5,g=Math.acos(1-2*(d/x)),v=Math.PI*(1+Math.sqrt(5))*d;r.set(Math.sin(g)*Math.cos(v),Math.cos(g),Math.sin(g)*Math.sin(v)).multiplyScalar(4.6),f=P(l,o,t()*.55)}else if(m<.93){const[d,g]=i[Math.floor(t()*i.length)],v=t();r.copy(n[d]).lerp(n[g],v).normalize().multiplyScalar(4.6*(1+.32*Math.sin(Math.PI*v))),f=P(a,p,t()*.35)}else{const d=n[Math.floor(t()*n.length)];r.copy(d).multiplyScalar(4.6).add(new h.Vector3(t()-.5,t()-.5,t()-.5).multiplyScalar(.35)),f=p}e.set([r.x,r.y,r.z],u*3),s.set([f.r,f.g,f.b],u*3)}}function ye(e,s){const l=["#5b8f2a","#6fa83a","#4c7d24","#7fbf43","#5f9a30"].map(w),o=["#7a5230","#8d613a","#6a4527","#9b6e45","#5c3c22"].map(w),a=(m,f,d)=>{const g=Math.sin(m*91.7+f*12.9898+d*78.233)*43758.5453;return g-Math.floor(g)},p=.42,r=Math.cos(p),u=Math.sin(p);for(let m=0;m<x;m++){const f=Math.floor(t()*6),d=Math.floor(t()*16),g=Math.floor(t()*16),v=(d+.22+t()*.56)*.325-2.6,b=(g+.22+t()*.56)*.325-2.6;let S,y,C;f===0?(S=v,y=2.6,C=b):f===1?(S=v,y=-2.6,C=b):f===2?(S=v,y=-b,C=2.6):f===3?(S=-v,y=-b,C=-2.6):f===4?(S=2.6,y=-b,C=v):(S=-2.6,y=-b,C=-v);const N=a(f,d,g);let F;if(f===0)F=l[Math.floor(N*l.length)];else if(f===1)F=o[Math.floor(N*o.length)];else{const _e=2+(a(f+7,d,0)>.55?1:0)+(a(f+3,d,1)>.82?1:0);F=g<_e?l[Math.floor(N*l.length)]:o[Math.floor(N*o.length)]}const Ue=y*r-C*u,Ve=y*u+C*r;e.set([S,Ue,Ve],m*3);const ie=[1.9,.9,1.5,1.15,1.3,1.05][f];s.set([F.r*ie,F.g*ie,F.b*ie],m*3)}}function Se(e,s){const c=w("#c4b5fd"),n=w("#6366f1"),i=w("#1e1b4b"),l=1.12,o=Math.cos(l),a=Math.sin(l);for(let p=0;p<x;p++){const r=Math.pow(t(),.7)*13.5,m=Math.floor(t()*3)*(Math.PI*2/3)+r*.42+(t()-.5)*(.9-r*.03),f=Math.cos(m)*r,d=Math.sin(m)*r,g=(t()-.5)*(1.1-r*.06),v=r<2.2?P(c,n,r/2.2):P(n,i,Math.min(1,(r-2.2)/11));e.set([f,g*o-d*a,g*a+d*o],p*3),s.set([v.r,v.g,v.b],p*3)}}function Ae(e,s){const o=w("#4f46e5"),a=w("#22d3ee"),p=w("#e0e7ff"),r=w("#ffffff");for(let u=0;u<x;u++){const m=t();let f,d,g,v;if(m<.66){const b=t(),S=t()<.5?0:Math.PI,y=b*3.4*Math.PI*2+S,C=(t()-.5)*.22;f=Math.cos(y)*(2.1+C),g=Math.sin(y)*(2.1+C),d=(b-.5)*10,v=P(o,a,b)}else if(m<.92){const b=Math.floor(t()*34),S=(b+.5)/34,y=S*3.4*Math.PI*2,C=t()*2-1;f=Math.cos(y)*2.1*C,g=Math.sin(y)*2.1*C,d=(S-.5)*10,v=P(p,a,.35)}else{const b=Math.floor(t()*15),S=(b+.5)/15,y=S*3.4*Math.PI*2;f=Math.cos(y)*2.1+(t()-.5)*.3,g=Math.sin(y)*2.1+(t()-.5)*.3,d=(S-.5)*10+(t()-.5)*.3,v=r}e.set([f,d,g],u*3),s.set([v.r,v.g,v.b],u*3)}}function Ce(e,s){const c=w("#ffffff"),n=w("#8b5cf6"),i=(o,a)=>a>=.2&&a<=4&&Math.abs(o)<=.8||a<.2&&a>=-1.9&&Math.abs(o)<=(a+1.9)*1.05||a<=-2.7&&a>=-3.4&&Math.abs(o)<=3.3||a<=-1.6&&a>-2.7&&Math.abs(o)>=2.6&&Math.abs(o)<=3.3;let l=0;for(;l<x;){const o=(t()-.5)*7,a=t()*7.6-3.5;if(!i(o,a))continue;const p=(t()-.5)*.7,r=P(n,c,(a+3.5)/7.5);e.set([o,a+.2,p],l*3),s.set([r.r,r.g,r.b],l*3),l++}}function ze(e,s){const c=w("#312e81"),n=w("#64748b");for(let i=0;i<x;i++){const l=P(c,n,t()).multiplyScalar(.55+t()*.35);e.set([(t()-.5)*34,(t()-.5)*20,(t()-.5)*12],i*3),s.set([l.r,l.g,l.b],i*3)}}function Pe(e,s){const c=w("#db2777"),n=w("#f9a8d4"),i=w("#a78bfa"),l=w("#ffffff");for(let o=0;o<x;o++){const a=t()*Math.PI*2,p=t()<.34,r=p?.97+t()*.05:Math.sqrt(t())*.96,u=16*Math.pow(Math.sin(a),3),m=13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a),f=Math.sqrt(Math.max(0,1-r*r))*1.05+.08,d=p?(t()-.5)*.25:(t()<.5?-1:1)*f*(.85+t()*.15),g=u*r*.25,v=(m*r+2.5)*.25,b=t()<.04?l:P(P(c,n,(v+3.6)/7.2),i,Math.max(0,g/4)*.55);e.set([g,v,d],o*3),s.set([b.r,b.g,b.b],o*3)}}function Re(e,s){const c=w("#7c3aed"),n=w("#c4b5fd");for(let i=0;i<x;i++){const l=t()*2-1,o=t()*Math.PI*2,a=Math.sqrt(1-l*l)*3.6,p=P(c,n,t());e.set([a*Math.cos(o),l*3.6,a*Math.sin(o)],i*3),s.set([p.r,p.g,p.b],i*3)}}function ke(e,s,c){const i=document.createElement("canvas");i.width=i.height=220;const l=i.getContext("2d",{willReadFrequently:!0});l.drawImage(c,0,0,220,220);const o=l.getImageData(0,0,220,220).data,a=[];for(let r=0;r<220;r++)for(let u=0;u<220;u++)o[(r*220+u)*4+3]>120&&a.push(u,r);if(a.length<200)return!1;const p=8.2;for(let r=0;r<x;r++){const u=Math.floor(t()*(a.length/2))*2,m=a[u]+t(),f=a[u+1]+t(),d=(Math.floor(f)*220+Math.floor(m))*4;e.set([(m/220-.5)*p,-(f/220-.5)*p,(t()-.5)*.9],r*3),s.set([o[d]/255*.75,o[d+1]/255*.75,o[d+2]/255*.75],r*3)}return!0}const B=new h.BufferGeometry,z=[],R=[];for(let e=0;e<T;e++)z.push(new Float32Array(x*3)),R.push(new Float32Array(x*3));Se(z[0],R[0]),Re(z[1],R[1]),ye(z[2],R[2]),ze(z[3],R[3]),Ce(z[4],R[4]),xe(z[5],R[5]),Ae(z[6],R[6]),Pe(z[7],R[7]);const le=new Float32Array(x);for(let e=0;e<x;e++)le[e]=t();const $=e=>Math.round(Math.min(1,Math.max(0,e/2))*127),J=[new Float32Array(x*4),new Float32Array(x*4)],se=()=>{for(let e=0;e<T;e++){const s=J[e>>2],c=R[e];for(let n=0;n<x;n++)s[n*4+(e&3)]=$(c[n*3])*16384+$(c[n*3+1])*128+$(c[n*3+2])}};se(),B.setAttribute("position",new h.BufferAttribute(z[0],3));for(let e=1;e<T;e++)B.setAttribute("aS"+e,new h.BufferAttribute(z[e],3));B.setAttribute("aCA",new h.BufferAttribute(J[0],4)),B.setAttribute("aCB",new h.BufferAttribute(J[1],4)),B.setAttribute("aRand",new h.BufferAttribute(le,1)),B.boundingSphere=new h.Sphere(new h.Vector3,40);const U=new Image;U.decoding="async",U.onload=()=>{try{ke(z[1],R[1],U)&&(se(),B.attributes.aS1.needsUpdate=!0,B.attributes.aCA.needsUpdate=!0)}catch(e){console.warn("Hyperix particle logo sampling failed",e)}},U.src="./assets/hyperix-artwork-main.png";const M={uTime:{value:0},uMorph:{value:0},uReveal:{value:G?1:0},uScatter:{value:0},uSize:{value:I?4.4:4.6},uPixelRatio:{value:Math.min(window.devicePixelRatio||1,1.75)},uOpacity:{value:I?.6:.85},uPointer:{value:new h.Vector3(999,999,0)},uPointerStrength:{value:0},uOffset:{value:Array.from({length:T},()=>new h.Vector3)},uScale:{value:new Array(T).fill(1)},uSpin:{value:[.035,0,.22,.02,0,.16,.2,0]}},Te=`
    uniform float uTime, uMorph, uReveal, uScatter, uSize, uPixelRatio, uPointerStrength;
    uniform vec3 uPointer;
    uniform vec3 uOffset[${T}];
    uniform float uScale[${T}];
    uniform float uSpin[${T}];
    attribute vec3 aS1; attribute vec3 aS2; attribute vec3 aS3; attribute vec3 aS4; attribute vec3 aS5; attribute vec3 aS6; attribute vec3 aS7;
    attribute vec4 aCA; attribute vec4 aCB;
    attribute float aRand;
    varying vec3 vColor;
    varying float vAlpha;

    vec3 place(vec3 p, int k) {
      float a = 0.0; float s = 1.0; vec3 o = vec3(0.0);
      if (k == 0) { a = uSpin[0]; s = uScale[0]; o = uOffset[0]; }
      else if (k == 1) { a = uSpin[1]; s = uScale[1]; o = uOffset[1]; }
      else if (k == 2) { a = uSpin[2]; s = uScale[2]; o = uOffset[2]; }
      else if (k == 3) { a = uSpin[3]; s = uScale[3]; o = uOffset[3]; }
      else if (k == 4) { a = uSpin[4]; s = uScale[4]; o = uOffset[4]; }
      else if (k == 5) { a = uSpin[5]; s = uScale[5]; o = uOffset[5]; }
      else if (k == 6) { a = uSpin[6]; s = uScale[6]; o = uOffset[6]; }
      else {
        // The heart beats: two quick pulses per cycle.
        a = uSpin[7]; o = uOffset[7];
        s = uScale[7] * (1.0 + 0.045 * pow(abs(sin(uTime * 1.9)), 12.0));
      }
      float r = uTime * a;
      float c = cos(r), sn = sin(r);
      p *= s;
      return vec3(p.x * c + p.z * sn, p.y, -p.x * sn + p.z * c) + o;
    }
    vec3 unpack(float v) {
      float r = floor((v + 0.5) / 16384.0);
      float rest = v - r * 16384.0;
      float g = floor((rest + 0.5) / 128.0);
      return vec3(r, g, rest - g * 128.0) * (2.0 / 127.0);
    }
    float stage(float k) {
      float t = clamp((uMorph - (k - 1.0)) * 1.5 - aRand * 0.5, 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }
    void main() {
      vec3 p = place(position, 0); vec3 col = unpack(aCA.x); float swirl = 0.0; float w;
      w = stage(1.0); p = mix(p, place(aS1, 1), w); col = mix(col, unpack(aCA.y), w); swirl += w * (1.0 - w);
      w = stage(2.0); p = mix(p, place(aS2, 2), w); col = mix(col, unpack(aCA.z), w); swirl += w * (1.0 - w);
      w = stage(3.0); p = mix(p, place(aS3, 3), w); col = mix(col, unpack(aCA.w), w); swirl += w * (1.0 - w);
      w = stage(4.0); p = mix(p, place(aS4, 4), w); col = mix(col, unpack(aCB.x), w); swirl += w * (1.0 - w);
      w = stage(5.0); p = mix(p, place(aS5, 5), w); col = mix(col, unpack(aCB.y), w); swirl += w * (1.0 - w);
      w = stage(6.0); p = mix(p, place(aS6, 6), w); col = mix(col, unpack(aCB.z), w); swirl += w * (1.0 - w);
      w = stage(7.0); p = mix(p, place(aS7, 7), w); col = mix(col, unpack(aCB.w), w); swirl += w * (1.0 - w);

      vec3 dir = normalize(vec3(sin(aRand * 91.7), cos(aRand * 47.3), sin(aRand * 13.1 + 1.0)) + 0.0001);
      // Particles swirl through space between two shapes, then settle.
      p += vec3(sin(aRand * 40.0 + uTime * 1.3), cos(aRand * 23.0 + uTime * 1.1), sin(aRand * 57.0 + uTime * 0.9)) * swirl * 9.0;
      p += vec3(sin(uTime * 0.8 + aRand * 30.0), cos(uTime * 0.7 + aRand * 17.0), sin(uTime * 0.6 + aRand * 11.0)) * 0.05;
      p += dir * uScatter * (0.6 + aRand);
      float reveal = clamp(uReveal * 1.35 - aRand * 0.35, 0.0, 1.0);
      reveal = 1.0 - pow(1.0 - reveal, 3.0);
      p = mix(dir * (16.0 + aRand * 12.0), p, reveal);

      vec4 world = modelMatrix * vec4(p, 1.0);
      vec2 d = world.xy - uPointer.xy;
      float force = exp(-dot(d, d) / 1.7) * uPointerStrength;
      world.xy += normalize(d + 0.0001) * force * 1.25;
      world.z += force * 0.9;

      vec4 view = viewMatrix * world;
      gl_Position = projectionMatrix * view;
      gl_PointSize = uSize * (0.55 + aRand * 0.9) * uPixelRatio * (12.0 / -view.z);
      vColor = col + force * 0.35;
      vAlpha = (0.55 + 0.45 * (0.5 + 0.5 * sin(uTime * 1.6 + aRand * 60.0))) * reveal;
    }`,Be=`
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = length(c);
      if (d > 0.5) discard;
      float a = pow(smoothstep(0.5, 0.0, d), 1.25) * vAlpha * uOpacity;
      gl_FragColor = vec4(vColor * a, a);
    }`,He=new h.ShaderMaterial({uniforms:M,vertexShader:Te,fragmentShader:Be,transparent:!0,depthWrite:!1,blending:h.AdditiveBlending}),V=new h.Points(B,He);V.frustumCulled=!1;const K=new h.Scene,A=new h.PerspectiveCamera(50,window.innerWidth/window.innerHeight,.1,120);A.position.set(0,0,18);const _=new h.WebGLRenderer({canvas:W,alpha:!0,antialias:!1,powerPreference:"high-performance"});_.setPixelRatio(M.uPixelRatio.value),_.setSize(window.innerWidth,window.innerHeight),K.add(V);const D=[["#4f46e5","#a78bfa",1],["#7c3aed","#22d3ee",1],["#059669","#38bdf8",.95],["#1e3a8a","#475569",.5],["#0891b2","#8b5cf6",1.05],["#0d9488","#4ade80",.95],["#d97706","#6366f1",.9],["#db2777","#a78bfa",.85]].map(([e,s,c])=>({a:w(e),b:w(s),k:c})),k={uTime:M.uTime,uTravel:{value:0},uPulse:{value:-100},uIntensity:{value:1},uFade:{value:H?1:0},uGrid:{value:H?0:1},uHorizon:{value:I?.3:.34},uAspect:{value:window.innerWidth/window.innerHeight},uColA:{value:D[0].a.clone()},uColB:{value:D[0].b.clone()},uMouse:{value:new h.Vector2(.5,.5)},uMouseOn:M.uPointerStrength},Ee=new h.ShaderMaterial({uniforms:k,extensions:{derivatives:!0},depthTest:!1,depthWrite:!1,blending:h.NoBlending,vertexShader:`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,fragmentShader:`
      uniform float uTime, uTravel, uPulse, uIntensity, uFade, uGrid, uHorizon, uAspect, uMouseOn;
      uniform vec3 uColA, uColB;
      uniform vec2 uMouse;
      varying vec2 vUv;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
      void main() {
        vec2 uv = vUv;
        float t = uTime, above = uv.y - uHorizon;
        vec3 col = vec3(0.0);
        vec2 m = (uv - uMouse) * vec2(uAspect, 1.0);
        float spot = exp(-dot(m, m) * 9.0) * uMouseOn;

        // Aurora curtains: a domain-warped band with drifting vertical rays.
        if (above > -0.02) {
          float x = (uv.x - 0.5) * uAspect;
          float n = fbm(vec2(x * 0.9 + t * 0.025, t * 0.05));
          float band = exp(-pow((uv.y - (uHorizon + 0.26 + (n - 0.5) * 0.28)) * 4.2, 2.0));
          float rays = smoothstep(0.25, 0.85, fbm(vec2(x * 5.5 + n * 3.0, uv.y * 0.8 - t * 0.08)));
          float n2 = fbm(vec2(x * 1.4 - t * 0.02 + 5.0, t * 0.04 + 3.0));
          float band2 = exp(-pow((uv.y - (uHorizon + 0.5 + n2 * 0.1)) * 6.0, 2.0)) * 0.45;
          vec3 tint = mix(uColA, uColB, smoothstep(0.2, 0.8, n + rays * 0.3));
          col += tint * (band * (0.35 + 0.65 * rays) * 0.55 + band2 * rays * 0.4) * smoothstep(0.0, 0.12, above) * (1.0 + spot * 0.6);
        }
        float hz = abs(above);
        col += uColB * (exp(-hz * 70.0) * 0.35 + exp(-hz * 9.0) * 0.07);

        // Voxel grid floor in perspective, scrolled forward by page travel.
        if (above < 0.0 && uGrid > 0.0) {
          float depth = 0.9 / max(-above, 0.0015);
          vec2 w = vec2((uv.x - 0.5) * uAspect * depth, depth + uTravel);
          vec2 cell = floor(w);
          vec2 edge = 0.5 - abs(fract(w) - 0.5);
          vec2 line = 1.0 - smoothstep(vec2(0.0), fwidth(w) * 1.5, edge);
          float grid = max(line.x, line.y);
          float fog = exp(-depth * 0.06) * smoothstep(0.0, 0.05, -above);
          float age = t - uPulse;
          float wave = exp(-pow((depth - age * 14.0) * 0.6, 2.0)) * exp(-age * 0.7) * step(0.0, age);
          float r = hash(cell);
          float lit = step(0.94, r) * (0.55 + 0.45 * sin(t * 1.4 + r * 60.0));
          float near = spot * 2.2;
          vec3 lineCol = mix(uColA, uColB, 0.5 + 0.5 * sin(cell.x * 0.35 + t * 0.2));
          col += (lineCol * grid * (0.34 + near * 0.7 + wave * 1.1)
            + uColB * lit * (0.22 + wave * 0.6 + near * 0.5)
            + uColB * wave * 0.08) * fog * uGrid;
          // Aurora light reflected on the floor just below the horizon.
          col += mix(uColA, uColB, 0.6) * exp(above * 9.0) * 0.1 * uGrid;
        }

        float shade = smoothstep(0.35, 0.9, length((uv - 0.5) * vec2(1.0, 1.15))) * 0.55;
        col *= uIntensity * uFade;
        col = max(col + (hash(uv * 913.0 + fract(t) * 37.0) - 0.5) * 0.012 * uFade, 0.0);
        // Premultiplied output: light adds over the page, the vignette darkens it.
        float alpha = clamp(max(max(col.r, col.g), col.b) + shade * uFade, 0.0, 1.0);
        gl_FragColor = vec4(min(col, vec3(alpha)), alpha);
      }`}),Q=new h.Mesh(new h.PlaneGeometry(2,2),Ee);Q.frustumCulled=!1,Q.renderOrder=-1,K.add(Q);const Ie=[[0,0,1.15],[0,-1.2,1.5],[9.4,-1.1,.8],[0,0,1.2],[9.2,-.4,.88],[0,-.4,1.12],[-8.4,-4.4,.55],[-8,-2,.7]],Oe=[[0,0,.8],[0,.2,.7],[0,.6,.6],[0,0,.9],[0,.6,.6],[0,.4,.66],[0,0,.62],[0,.4,.6]],Fe=[{shape:6,name:"changelog",box:[5,10.6]},{shape:7,name:"credits",box:[8.4,7.6]}].map(e=>({...e,els:Array.from(document.querySelectorAll(`[data-hx-shape-slot="${e.name}"]`))})).filter(e=>e.els.length),Z=Math.tan(h.MathUtils.degToRad(25))*18;function We(){const e=window.innerWidth,s=window.innerHeight,c=Z*A.aspect;Fe.forEach(n=>{const i=n.els.map(a=>a.getBoundingClientRect()).find(a=>a.width>0&&a.height>0);if(!i)return;const l=i.width/e*2*c,o=i.height/s*2*Z;M.uOffset.value[n.shape].set(((i.left+i.width/2)/e*2-1)*c,(1-(i.top+i.height/2)/s*2)*Z,0),M.uScale.value[n.shape]=Math.min(l/n.box[0],o/n.box[1])*.92})}function ce(){const e=window.innerWidth/window.innerHeight;A.aspect=e,A.updateProjectionMatrix(),k.uAspect.value=e,_.setSize(window.innerWidth,window.innerHeight);const s=Math.tan(h.MathUtils.degToRad(25))*18*e;(e<1?Oe:Ie).forEach(([n,i,l],o)=>{const a=Math.max(0,s-4.3*l);M.uOffset.value[o].set(Math.min(n,a),i,0),M.uScale.value[o]=l})}ce();const ee=new h.Vector2(9,9);let Y=0,L=0,q=0;window.addEventListener("pointermove",e=>{e.pointerType!=="touch"&&(L=e.clientX/window.innerWidth*2-1,q=-(e.clientY/window.innerHeight)*2+1,ee.set(L,q),Y=1)},{passive:!0}),document.addEventListener("pointerleave",()=>{Y=0});const ue=()=>{if(H)return re;const e=window.innerHeight;let s=0;return be.forEach(c=>{c&&(s+=Math.min(1,Math.max(0,(e*.78-c.getBoundingClientRect().top)/(e*.6))))}),s};let fe=0;window.addEventListener("resize",()=>{clearTimeout(fe),fe=setTimeout(ce,120)});const he=new h.Clock,te=new h.Vector3;let j=!0,E=0,O=ue(),X=0;const Ge=M.uOpacity.value,de=document.querySelector("body > footer"),pe=document.getElementById("top"),Le=(I?.85:1)*(H?.6:1);let ae=1,ve=Math.round(O),oe=window.scrollY/window.innerHeight*2.2;function qe(e,s){const c=G?1:1-Math.exp(-e*4),n=Math.min(T-2,Math.floor(O)),i=Math.min(1,Math.max(0,O-n)),l=i*i*(3-2*i),o=D[n],a=D[n+1];if(k.uColA.value.copy(o.a).lerp(a.a,l),k.uColB.value.copy(o.b).lerp(a.b,l),k.uIntensity.value=(o.k+(a.k-o.k)*l)*Le,k.uMouse.value.set((L+1)/2,(q+1)/2),H)return;const p=pe?1-Math.min(1,Math.max(0,pe.getBoundingClientRect().bottom/window.innerHeight)):1,r=Math.min(1,p*1.6)*(.25+.75*ae)*Math.min(1,M.uReveal.value*1.5);k.uFade.value+=(r-k.uFade.value)*c,oe+=(window.scrollY/window.innerHeight*2.2-oe)*c,k.uTravel.value=oe;const u=Math.round(s);u!==ve&&(ve=u,G||(k.uPulse.value=X))}function we(){if(E=0,!j||document.hidden)return;const e=Math.min(he.getDelta(),.05);G||(X+=e),M.uTime.value=X;const s=ue();O+=(s-O)*(G?1:1-Math.exp(-e*4.2)),M.uMorph.value=O,de&&!H&&(ae=Math.min(1,Math.max(0,(de.getBoundingClientRect().top-window.innerHeight*.3)/(window.innerHeight*.5))),M.uOpacity.value=Ge*(.1+.9*ae)),H||We(),M.uReveal.value<1&&(M.uReveal.value=Math.min(1,M.uReveal.value+e/2.6)),qe(e,s);const c=window.hyperixLenis,n=c&&typeof c.velocity=="number"?Math.abs(c.velocity):0;M.uScatter.value+=(Math.min(1.6,n/22)-M.uScatter.value)*(1-Math.exp(-e*6)),A.position.x+=(L*.9-A.position.x)*(1-Math.exp(-e*2.5)),A.position.y+=(q*.6-A.position.y)*(1-Math.exp(-e*2.5)),A.lookAt(0,0,0),te.set(ee.x,ee.y,.5).unproject(A).sub(A.position).normalize();const i=-A.position.z/te.z;M.uPointer.value.copy(A.position).addScaledVector(te,i),M.uPointerStrength.value+=(Y-M.uPointerStrength.value)*(1-Math.exp(-e*5)),Y*=Math.exp(-e*.8),V.rotation.y=Math.sin(X*.12)*.12+L*.08,V.rotation.x=q*-.05,_.render(K,A),E=requestAnimationFrame(we)}function ne(){E||!j||document.hidden||(he.getDelta(),E=requestAnimationFrame(we))}function me(){E&&cancelAnimationFrame(E),E=0}document.addEventListener("visibilitychange",()=>document.hidden?me():ne()),window.stopThreeScene=function(){j=!1,me(),W.style.display="none"},window.startThreeScene=function(){j=!0,W.style.display="block",ne()};const ge=(document.getElementById("top")||{}).nextElementSibling||null;ge&&ge.getBoundingClientRect().top>=window.innerHeight*.95?window.stopThreeScene():ne()})();
