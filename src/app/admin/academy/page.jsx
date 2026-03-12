'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Old route — redirect to new location
export default function OldAcademyAdminRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/academy/admin'); }, [router]);
  return null;
}
