'use client';

import Image from "next/image";
import { useEffect, useState } from "react";
import api from "../../api";
import defaultAvatar from '../../../public/profile-icon-png-8.jpg';
import { useAuth } from '../../context/AuthProvider';

export default function Avater() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfileImage(res.data.profileImage || null);
      } catch {
        setProfileImage(null);
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <Image 
      src={profileImage || defaultAvatar}  
      width={32}
      height={32}
      alt="Profile"
      className="rounded-full"
    />
  );
}
