import { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
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
    specs: ['Material: PETG', 'Estrutura principal que suporta todos os componentes eletrônicos', 'Design otimizado para velocidade e estabilidade em competições'], 
    matchers: ['chassi'] 
  },
  'roda': { 
    title: 'Rodas Sumo 500', 
    specs: ['Diâmetro: 65mm', 'Proporciona tração precisa em piso e movimento suave', 'Compatível com motores'], 
    matchers: ['roda', 'mesh_18_1', 'mesh_3_1'] 
  },
  'motor': { 
    title: 'Motor com Redução', 
    specs: ['Modelo: Motor DC 6V 750RPM', 'Converte energia elétrica em movimento rotativo', 'Redução de velocidade garante torque adequado para o chassi'], 
    image: '/motor.png',
    matchers: ['motor', 'mesh_15', 'mesh_16', 'bracadeira'] 
  },
  'sensor_tof': { 
    title: 'Sensores ToF', 
    specs: ['Modelo: VL53L0X', 'Detecta paredes do labirinto usando luz infravermelha', 'Essencial para o mapeamento e navegação autônoma'], 
    image: '/sensorTof.png',
    matchers: ['vl53l0x', 'mesh_46', 'mesh_47', 'mesh_48', 'mesh_49'] 
  },
  'bateria': {
    title: 'Bateria',
    specs: ['Modelo: LiPo-2S VP903048', 'Fornece energia para motores, eletrônica e sensores', 'Alimenta todo o sistema de forma autônoma durante as competições'],
    image: '/battery.png',
    customColors: {
      'tampa_bateria-1': '#080303',
      'bateria-1': '#005bb5' 
    },
    matchers: ['bateria', 'tampa_bateria']
  },
  'pcb': {
    title: 'Placa Principal',
    specs: ['Material: FR4', 'Integra todos os componentes eletrônicos em um único módulo', 'Facilita conexões, reduz peso e aumenta confiabilidade'],
    matchers: ['pcb', 'placaperfurada']
  },
  'parafusos': {
    title: 'Parafusos Allen',
    specs: ['Material: Inox', 'Garante resistência à corrosão e durabilidade', 'Fixa componentes estruturais mantendo segurança mecânica'],
    matchers: ['allen']
  },
  'caster': {
    title: 'Roda Boba',
    specs: ['Apoio frontal do chassi', 'Reduz fricção e melhora a mobilidade em curvas', 'Permite rotação livre em 360 graus para movimentação fluida'],
    matchers: ['ball', 'stand']
  },
  'esp32': {
    title: 'Microcontrolador',
    specs: ['Modelo: ESP32-S3', 'Execução local do algoritmo de navegação', 'Processamento PID e leitura de sensores'],
    image: '/esp32.png',
    matchers: ['mesh_22']
  },
  'driver_motor': {
    title: 'Ponte H',
    specs: ['Modelo: L298N', 'Controla a potência enviada aos motores', 'Recebe sinal PWM do ESP32'],
    image: '/ponteH.png',
    matchers: ['mesh_8'] 
  },
  'step_down': {
    title: 'Regulador de Tensão',
    specs: ['Modelo: LM2596', 'Reduz a tensão da bateria', 'Garante alimentação segura'],
    image: '/reguladorTensao.png',
    matchers: ['mesh_23']
  },
  'imu': {
    title: 'Giroscópio/Acelerômetro',
    specs: ['Modelo: MPU-6050', 'Mede a rotação no próprio eixo', 'Essencial para curvas precisas'],
    image: '/acelerometro.png',
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
  transparencyMode?: boolean;
}

function ModeloChassi({ onComponentClick, selectedComponent, transparencyMode }: ModeloChassiProps) {
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
          mesh.userData.logicalGroup = logicalGroup;

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
    let animationFrameId: number;
    
    const animate = () => {
      scene.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          
          const isHovered = hoveredGroup && mesh.userData.logicalGroup === hoveredGroup;
          const isSelected = selectedComponent && mesh.userData.logicalGroup === selectedComponent;

          if (isSelected) {
            material.emissive.setHex(0xff9800);
            const pulse = 0.6 + Math.sin(Date.now() * 0.003) * 0.15;
            material.emissiveIntensity = pulse;
          } else if (isHovered) {
            material.emissive.setHex(0xffffff);
            material.emissiveIntensity = 0.15;
          } else {
            material.emissive.setHex(0x000000); 
            material.emissiveIntensity = 0;
          }

          if (transparencyMode && selectedComponent) {
            if (isSelected) {
              material.transparent = false;
              material.opacity = 1;
            } else {
              material.transparent = true;
              material.opacity = 0.15;
              material.alphaTest = 0.01;
            }
          } else {
            material.transparent = false;
            material.opacity = 1;
            material.alphaTest = 0;
          }
          material.needsUpdate = true;
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hoveredGroup, selectedComponent, transparencyMode, scene]);
  
  return (
    <group ref={modelRef} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive 
        object={scene} 
        onPointerOver={(e: any) => {
          e.stopPropagation();
          const logicalGroup = e.object.userData.logicalGroup;
          if (logicalGroup !== 'other') {
            setHoveredGroup(logicalGroup);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e: any) => {
          e.stopPropagation();
          setHoveredGroup(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e: any) => {
          e.stopPropagation();
          const logicalGroup = e.object.userData.logicalGroup;
          if (logicalGroup !== 'other') {
            onComponentClick(logicalGroup);
            bounds.refresh(e.object).fit();
          }
        }}
      />
    </group>
  );
}

export function Chassi3D() {
  const [autoRotate, setAutoRotate] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transparencyMode, setTransparencyMode] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);
  const [detailsMode, setDetailsMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedComponent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setExpandedImage(false);
  }, [selectedComponent]);

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
    <div>
      <div className={styles.TopPage}>
        <div className={styles.header}>
          {/* <img src="/icon.svg" alt="XAROPi Logo" className={styles.logoIcon} /> */}
          <h2 className={styles.titulo}>Visão Interativa</h2>
        </div>
        <p className={styles.descricao}>
          <Icon name='mouse' size='lg'/> Passe o mouse e clique nos componentes para ver detalhes.<br/><br/>
        </p>
      </div>

    <div className={styles.container}>
      {}
      <div className={styles.controlPanel}>
        <span className={styles.Info}>Pressione <strong>ESC</strong> para afastar a câmera.</span>
        
        {}
        <div className={styles.generalSpecs}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Nome:</span>
            <p className={styles.specValue}>XAROPi</p>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Dimensão:</span>
            <p className={styles.specValue}>12,9 × 10,0 × 4,5 cm</p>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Peso Total:</span>
            <p className={styles.specValue}>328 g</p>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Comunicação:</span>
            <p className={styles.specValue}>WebSocket</p>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Alg. de Navegação:</span>
            <p className={styles.specValue}>Flood Fill</p>
          </div>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Mem./proces.:</span>
            <p className={styles.specValue}>5-10KBs RAM</p>
          </div>
          {/* <div className={styles.specItemCol}>
            <span className={styles.specLabel}>Objetivo:</span>
            <p className={styles.specValueText} key={Date.now()}>
              Travessia inteligente e autônoma em labirintos de 16×16, 8×8 e 4×4 células.
            </p>
          </div> */}
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
              <span className={styles.checkBox} />
              Girar automaticamente
            </label>
          </div>
          <div className={styles.controlGroup}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={transparencyMode} onChange={(e) => setTransparencyMode(e.target.checked)} />
              <span className={styles.checkBox} />
              Modo Raio-X
            </label>
          </div>
          <div className={styles.controlGroup}>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={detailsMode} onChange={(e) => setDetailsMode(e.target.checked)} />
              <span className={styles.checkBox} />
              Detalhes Eletrônicos
            </label>
          </div>
        </div>
      </div>
      {}
      {currentInfo && (
        <div className={styles.componentInfo}>
          <div className={styles.componentHeader}>
            <h3 className={styles.componentTitle} style={{ color: PART_CONFIG[selectedComponent || ''] ? 'var(--txt-interaction)' : 'var(--txt-secondary)' }}>
              {currentInfo.title}
            </h3>
            <Button type='circle' icon='close' hierarchy='tertiary' onClick={() => setSelectedComponent(null)}/>
          </div>
          
          {currentInfo.image && (
            <>
              {detailsMode && (
                <div style={{ 
                  margin: '12px 0', 
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  background: 'linear-gradient(135deg, rgba(255,152,0,0.08) 0%, rgba(0,0,0,0.15) 100%)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,152,0,0.2)',
                  animation: 'fadeInDown 0.3s ease',
                }}>
                  <img 
                    src={currentInfo.image} 
                    alt={currentInfo.title} 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }} 
                  />
                </div>
              )}
            </>
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
        <Suspense fallback={<Html center></Html>}>
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
                transparencyMode={transparencyMode}
              />
            </Bounds>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate={autoRotate} autoRotateSpeed={1} enableZoom={true} />
      </Canvas>
    </div>
    </div>
  );
}