import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useTheme } from "../../hooks/useTheme";

export default function Interactive3DScene() {
  const mountRef = useRef(null);
  const torusRef = useRef(null);
  const animRef = useRef(null);
  const { theme, color } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, theme === "light" ? 0.9 : 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim().slice(1), 16), 1.2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const torus = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.2, 0.3, 150, 32),
      new THREE.MeshStandardMaterial({
        color: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--primary").trim().slice(1), 16),
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.95,
      })
    );
    torus.position.y = -1.4;
    scene.add(torus);
    torusRef.current = torus;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;

    const animate = () => {
      torus.rotation.x += 0.005;
      torus.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [theme, color]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />;
}
