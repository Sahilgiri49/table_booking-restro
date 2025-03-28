
import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Table component for the scene
const Table = ({ position, size = [1, 0.5, 1], isAvailable = true, onClick, tableId }: { 
  position: [number, number, number],
  size?: [number, number, number],
  isAvailable?: boolean,
  onClick?: () => void,
  tableId: number
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (hovered && meshRef.current) {
      meshRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.05 + position[1];
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        position={[0, 0, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={isAvailable ? '#7E69AB' : '#ff0000'} 
          opacity={0.8} 
          transparent
          emissive={hovered ? '#FEC6A1' : undefined}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      <Text
        position={[0, size[1] + 0.2, 0]}
        fontSize={0.2}
        color={isAvailable ? '#FFFFFF' : '#FF0000'}
        anchorX="center"
        anchorY="middle"
      >
        {`Table ${tableId}`}
      </Text>
    </group>
  );
};

// Floor component
const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#1A1F2C" />
    </mesh>
  );
};

// Floating food item
const FloatingDish = ({ position, modelPath = "/placeholder.svg" }: { 
  position: [number, number, number], 
  modelPath?: string 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime()) * 0.1;
      meshRef.current.rotation.y += 0.005;
    }
  });

  const texture = useTexture(modelPath);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.7, 0.7, 0.01]} />
      <meshStandardMaterial 
        map={texture} 
        transparent 
        opacity={0.9}
        emissive="#FFFFFF"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// Main scene component
interface RestaurantSceneProps {
  availableTables: number[];
  onTableSelect: (tableId: number) => void;
}

const RestaurantScene: React.FC<RestaurantSceneProps> = ({ availableTables, onTableSelect }) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={50} />
        <ambientLight intensity={0.3} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={0.8} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        <Floor />
        
        {/* Tables layout */}
        {[...Array(9)].map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const posX = (col - 1) * 2;
          const posZ = (row - 1) * 2;
          const isAvailable = availableTables.includes(index + 1);
          
          return (
            <Table 
              key={index} 
              position={[posX, 0, posZ]} 
              tableId={index + 1}
              isAvailable={isAvailable}
              onClick={() => isAvailable && onTableSelect(index + 1)}
            />
          );
        })}
        
        {/* Floating food items */}
        <FloatingDish position={[-3, 1.5, -3]} />
        <FloatingDish position={[3, 1.8, 3]} />
        <FloatingDish position={[0, 2, -4]} />
        
        {/* Controls with limits */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={4}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
};

export default RestaurantScene;
