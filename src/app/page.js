"use client";

import React from 'react';
import Login from './login/page';

export default function Home() {
  const handleNavigate = (route) => {
    console.log(`Navigating to ${route}`);
    // Once you add routes, you can use: router.push(route)
  };

  return (
   <Login/>  
  );
}