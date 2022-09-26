import React from 'react';
// ui
import { Skeleton } from 'antd';
import { ProfileLayout } from 'components/Lib';

export function ProfileSkeleton() {
  return (
    <ProfileLayout>
      <Skeleton active />
      <Skeleton active />
      <Skeleton active />
    </ProfileLayout>
  );
}
