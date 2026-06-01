import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html, Bounds, useBounds } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Chassi3D.module.css';

const PART_CONFIG: Record<string, { 
  title: string; 
  specs: string[]; 
  color?: string; 
  colorTargets?: string[]; 
  customColors?: Record<string, string>;
  image?: string; 
  matchers: string[] 
}> = {
  'chassi': { 
    title: 'Chassi XAROPi', 
    specs: ['Material: PETG', 'Peso: 328g'], 
    matchers: ['chassi'] 
  },
  'roda': { 
    title: 'Rodas Sumo 500', 
    specs: ['Diâmetro: 65mm', 'Material: Borracha'], 
    matchers: ['roda', 'mesh_18_1', 'mesh_3_1'] 
  },
  'motor': { 
    title: 'Motor com Redução', 
    specs: ['Tipo: Motor DC 6V 750RPM'], 
    matchers: ['motor', 'mesh_15', 'mesh_16', 'bracadeira'] 
  },
  'sensor_tof': { 
    title: 'Sensores ToF', 
    specs: ['Modelo: VL53L0X'], 
    matchers: ['vl53l0x', 'mesh_46', 'mesh_47', 'mesh_48', 'mesh_49'] 
  },
  'bateria': {
    title: 'Bateria',
    specs: ['Modelo: LiPo-2S VP903048'],
    image: '/battery.jpg',
    customColors: {
      'tampa_bateria-1': '#080303',
      'bateria-1': '#005bb5' 
    },
    matchers: ['bateria', 'tampa_bateria']
  },
  'pcb': {
    title: 'Placa Principal',
    specs: ['Material: FR4'],
    matchers: ['pcb', 'placaperfurada']
  },
  'parafusos': {
    title: 'Parafusos Allen',
    specs: ['Material: Inox'],
    matchers: ['allen']
  },
  'caster': {
    title: 'Roda Boba',
    specs: ['Apoio frontal'],
    matchers: ['ball', 'stand']
  },
  'esp32': {
    title: 'Microcontrolador',
    specs: ['Modelo: ESP32-S3', 'Execução local do algoritmo de navegação', 'Processamento PID e leitura de sensores'],
    matchers: ['mesh_22']
  },
  'driver_motor': {
    title: 'Ponte H',
    specs: ['Modelo: L298N', 'Controla a potência enviada aos motores', 'Recebe sinal PWM do ESP32'],
    matchers: ['mesh_8'] 
  },
  'step_down': {
    title: 'Regulador de Tensão',
    specs: ['Modelo: LM2596', 'Reduz a tensão da bateria', 'Garante alimentação segura'],
    matchers: ['mesh_23']
  },
  'imu': {
    title: 'Giroscópio/Acelerômetro',
    specs: ['Modelo: MPU-6050', 'Mede a rotação no próprio eixo', 'Essencial para curvas precisas'],
    matchers: ['mesh_24']
  }
};

function getLogicalGroup(meshName: string) {
  const lowerName = meshName.toLowerCase();
  for (const [groupId, config] of Object.entries(PART_CONFIG)) {
    if (config.matchers.some(matcher => lowerName.includes(matcher.toLowerCase()))) {
      return groupId;
    }
  }
  return 'other'; 
}

interface ModeloChassiProps {
  onComponentClick: (groupId: string) => void;
  selectedComponent?: string;
}

function ModeloChassi({ onComponentClick, selectedComponent }: ModeloChassiProps) {
  const { scene } = useGLTF('/xaropi.glb');
  const modelRef = useRef<THREE.Group>(null);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const bounds = useBounds();
  
  const baseScale = 4.5;

  useEffect(() => {
    if (!selectedComponent) {
      bounds.refresh().fit();
    }
  }, [selectedComponent, bounds]);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.scale.set(baseScale, baseScale, baseScale);
      
      scene.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          
          if (mesh.material) {
            mesh.material = (mesh.material as THREE.Material).clone();
          }

          const logicalGroup = getLogicalGroup(mesh.name);
          mesh.userData.logicalGroup = logicalGroup === 'other' ? mesh.name : logicalGroup;

          if (logicalGroup !== 'other') {
            const config = PART_CONFIG[logicalGroup];
            const stdMaterial = mesh.material as THREE.MeshStandardMaterial;

            let colorApplied = false;

            if (config.customColors) {
              for (const [meshMatch, colorValue] of Object.entries(config.customColors)) {
                if (mesh.name.toLowerCase().includes(meshMatch.toLowerCase())) {
                  stdMaterial.color.set(colorValue);
                  colorApplied = true;
                  break;
                }
              }
            }

            if (!colorApplied && config.color) {
              const targets = config.colorTargets;
              if (!targets || targets.includes(mesh.name)) {
                stdMaterial.color.set(config.color);
              }
            }
          }
        }
      });
    }
  }, [scene]);

  useEffect(() => {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        
        const isHovered = hoveredGroup && mesh.userData.logicalGroup === hoveredGroup;
        const isSelected = selectedComponent && mesh.userData.logicalGroup === selectedComponent;

        if (isSelected) {
          material.emissive.setHex(0xff9800); 
          material.emissiveIntensity = 0.35;
        } else if (isHovered) {
          material.emissive.setHex(0xffffff);
          material.emissiveIntensity = 0.15;
        } else {
          material.emissive.setHex(0x000000); 
          material.emissiveIntensity = 0;
        }
      }
    });
  }, [hoveredGroup, selectedComponent, scene]);
  
  return (
    <group ref={modelRef} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive 
        object={scene} 
        onPointerOver={(e: any) => {
          e.stopPropagation(); 
          setHoveredGroup(e.object.userData.logicalGroup);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e: any) => {
          e.stopPropagation();
          setHoveredGroup(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e: any) => {
          e.stopPropagation();
          onComponentClick(e.object.userData.logicalGroup);
          bounds.refresh(e.object).fit(); 
        }}
      />
    </group>
  );
}

export function Chassi3D() {
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedComponent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleModelLoad = () => {
    setIsLoading(false);
  };

  const currentInfo = selectedComponent 
    ? PART_CONFIG[selectedComponent] || {
        title: 'Componente Estrutural',
        specs: [`ID: ${selectedComponent}`]
      }
    : null;

  return (
    <div className={styles.container}>
      
      {}
      <div className={styles.controlPanel}>
        
        <div className={styles.header}>
          <img src="/icon.svg" alt="XAROPi Logo" className={styles.logoIcon} />
          <h1 className={styles.titulo}>Visão Interativa</h1>
        </div>
        
        <p className={styles.descricao}>
          Explore o design mecânico do XAROPi. Passe o mouse e clique nos componentes para ver detalhes.<br/><br/>
          <span style={{ fontSize: '11px', color: '#ffb74d' }}>Pressione <strong>ESC</strong> para afastar a câmera.</span>
        </p>
        
        {}
        <div className={styles.generalSpecs}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Nome:</span>
            <span className={styles.specValue}>XAROPi</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Dimensão:</span>
            <span className={styles.specValue}>12,9 × 10,0 × 4,5 cm</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Peso Total:</span>
            <span className={styles.specValue}>328 g</span>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Alg. de Navegação:</span>
            <span className={styles.specValue}>Flood Fill</span>
          </div>
          <div className={styles.specItemCol}>
            <span className={styles.specLabel}>Objetivo:</span>
            <span className={styles.specValueText} key={Date.now()}>
              Travessia inteligente e autônoma em labirintos de 16×16, 8×8 e 4×4 células.
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label>
              <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} /> 
              Girar automaticamente
            </label>
          </div>
        </div>
      </div>

      {}
      {currentInfo && (
        <div className={styles.componentInfo}>
          <button className={styles.closeBtn} onClick={() => setSelectedComponent(null)}>✕</button>
          
          <h3 className={styles.componentTitle} style={{ color: PART_CONFIG[selectedComponent || ''] ? '#ff9800' : '#aaaaaa' }}>
            {currentInfo.title}
          </h3>
          
          {currentInfo.image && (
            <div style={{ margin: '16px 0', textAlign: 'center' }}>
              <img 
                src={currentInfo.image} 
                alt={currentInfo.title} 
                style={{ 
                  width: '100%', 
                  maxHeight: '220px', 
                  borderRadius: '6px', 
                  objectFit: 'contain', 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '4px'
                }} 
              />
            </div>
          )}

          <ul className={styles.specsList}>
            {currentInfo.specs.map((spec, idx) => (<li key={idx}>{spec}</li>))}
          </ul>
        </div>
      )}

      {/* ÁREA DO 3D */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Carregando o modelo...</p>
          </div>
        </div>
      )}
      <Canvas shadows camera={{ position: [5, 3, 5], fov: 45 }} className={styles.canvas} onCreated={() => setTimeout(handleModelLoad, 1500)}>
        <Suspense fallback={<Html center><span style={{ color: 'white' }}>Carregando modelo 3D...</span></Html>}>
          <ambientLight intensity={0.15} />
          <Stage 
            environment="warehouse" 
            preset="soft" 
            intensity={0.8} 
            contactShadow={{ opacity: 0.8, blur: 3 }} 
          >
            <Bounds fit clip observe margin={1.2}>
              <ModeloChassi 
                onComponentClick={setSelectedComponent}
                selectedComponent={selectedComponent || undefined}
              />
            </Bounds>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate={autoRotate} autoRotateSpeed={1} enableZoom={true} />
      </Canvas>
    </div>
  );
}