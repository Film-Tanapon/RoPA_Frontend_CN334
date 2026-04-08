"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3340/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Token: " + data.access_token)
        localStorage.setItem("access_token",data.access_token)
        alert("เข้าสู่ระบบสำเร็จ!");
        router.push('/RoPA_records');
      } else {
        alert(data.detail || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      alert("ไม่สามารถติดต่อ Server ได้");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden font-sans">

      <div className="flex-1 flex items-center justify-end z-10 bg-white md:pr-0">
        <div className="relative w-full h-full flex items-center justify-end">
          <img
            src="https://www.svgrepo.com/show/530181/dinosaur.svg"
            alt="Pointing Dinosaur"
            className="object-contain transform scale-x-100 max-w-none"
            style={{ transform: 'scaleX(-1) scale(2) translateX(50px)' }}
          />
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 md:p-20">

        <div className="absolute inset-0 bg-sky-100 hidden md:block"
          style={{ clipPath: 'circle(70% at 80% 50%)' }}>
        </div>
        <div className="absolute inset-0 bg-sky-50 md:hidden"></div>

        <div className="relative z-20 w-full max-w-xl">
          <div className="mb-10 text-left pl-10 md:pl-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-950 leading-tight">
              Welcome to <br />
              <span className="text-slate-900 font-bold whitespace-nowrap">
                CN334-RoPA Project
              </span>
            </h1>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              className="w-full ml-20 px-7 py-6 text-xl rounded-xl border-2 border-slate-950 outline-none text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400 transition shadow-sm"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <input
              type="password"
              className="w-full ml-20 px-7 py-6 text-xl rounded-xl border-2 border-slate-950 outline-none text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400 transition shadow-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="ml-40 px-12 py-3 bg-white border-2 border-slate-950 text-slate-950 rounded-xl font-bold hover:bg-slate-950 hover:text-white transition duration-200 shadow-[5px_5px_0px_0px_rgba(2,6,23,1)] active:shadow-none active:translate-y-1 text-lg"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
    </div >
  );
};

export default LoginPage;