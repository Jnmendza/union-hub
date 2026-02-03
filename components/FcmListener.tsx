"use client";

import useFcmToken from "@/hooks/useFcmToken";

export default function FcmListener() {
  useFcmToken();
  return null;
}
