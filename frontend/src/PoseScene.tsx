/// <reference types="@react-three/fiber" />
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { PosePerson } from './types';

function pointToVec(p: { x: number; y: number; z: number }) {
  return new THREE.Vector3((p.x - 0.5) * 4, -(p.y - 0.5) * 4, -p.z * 2);
}

function BoneLine({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const line = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const material = new THREE.LineBasicMaterial({ color: 'hotpink' });
    return new THREE.Line(geometry, material);
  }, [from, to]);

  React.useEffect(() => {
    return () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  return <primitive object={line} />;
}

function Skeleton({ person, bones }: { person: PosePerson; bones: [string, string][] }) {
  return (
    <group rotation={[0.15, -0.25, 0]}>
      {bones.map(([a, b]) => {
        const pa = person.keypoints[a];
        const pb = person.keypoints[b];
        if (!pa || !pb || pa.score < 0.2 || pb.score < 0.2) return null;
        return <BoneLine key={`${a}-${b}`} from={pointToVec(pa)} to={pointToVec(pb)} />;
      })}
      {Object.entries(person.keypoints).map(([name, p]) => {
        if (!p || p.score < 0.2) return null;
        const v = pointToVec(p);
        return (
          <mesh key={name} position={v}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
        );
      })}
    </group>
  );
}

export default function PoseScene({ person, bones }: { person: PosePerson | null; bones: [string, string][] }) {
  if (Platform.OS !== 'web') {
    return <Text>This simple 3D view is currently intended for Expo Web. For native builds, switch to an expo-gl implementation.</Text>;
  }

  return (
    <View style={{ height: 420, backgroundColor: '#151515', borderRadius: 12, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1} />
        <gridHelper args={[6, 12]} />
        {person ? <Skeleton person={person} bones={bones} /> : null}
      </Canvas>
    </View>
  );
}
