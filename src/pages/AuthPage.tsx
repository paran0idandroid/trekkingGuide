import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { simulateSendSms } from '../lib/auth';

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);

  const handleSendCode = () => {
    const cleaned = phone.replace(/\s/g, '');
    if (!/^1\d{10}$/.test(cleaned)) {
      setError('请输入有效的11位手机号');
      return;
    }
    setError('');
    const c = simulateSendSms(cleaned);
    setSentCode(c);
    setStep('code');
    setTimeout(() => codeRef.current?.focus(), 100);
  };

  const handleVerify = () => {
    if (code === sentCode) {
      const cleaned = phone.replace(/\s/g, '');
      login(cleaned);
      navigate('/');
    } else {
      setError('验证码错误');
    }
  };

  const handleBack = () => {
    setStep('phone');
    setCode('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-forest-800 mb-1 text-center">
            {step === 'phone' ? '登录 / 注册' : '输入验证码'}
          </h1>
          <p className="text-sm text-forest-600 text-center mb-8">
            {step === 'phone'
              ? '使用手机号登录，首次使用将自动注册'
              : `验证码已发送至 ${phone}`}
          </p>

          {step === 'phone' ? (
            <>
              <div className="mb-4">
                <label className="text-xs text-forest-500 mb-1.5 block">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
                  placeholder="请输入手机号"
                  className="w-full bg-white/70 border border-forest-200 rounded-xl px-4 py-3 text-forest-800 text-sm outline-none focus:border-forest-400 transition-colors placeholder:text-forest-300"
                />
              </div>
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <button
                onClick={handleSendCode}
                className="w-full bg-forest-500 text-white hover:bg-forest-600 py-3 rounded-xl text-sm transition-all duration-300"
              >
                获取验证码
              </button>
            </>
          ) : (
            <>
              <div className="mb-2">
                <div className="bg-white/70 border border-forest-200 rounded-xl px-4 py-4 text-center">
                  <p className="text-[11px] text-forest-400 mb-2">验证码（模拟）</p>
                  <p className="text-2xl font-mono font-bold tracking-[0.3em] text-green-400">
                    {sentCode}
                  </p>
                </div>
              </div>
              <div className="mb-4 mt-4">
                <label className="text-xs text-forest-500 mb-1.5 block">输入验证码</label>
                <input
                  ref={codeRef}
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="输入6位验证码"
                  className="w-full bg-white/70 border border-forest-200 rounded-xl px-4 py-3 text-forest-800 text-sm outline-none focus:border-forest-400 transition-colors placeholder:text-forest-300 text-center tracking-[0.3em]"
                  maxLength={6}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                />
              </div>
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <button
                onClick={handleVerify}
                className="w-full bg-forest-500 text-white hover:bg-forest-600 py-3 rounded-xl text-sm transition-all duration-300 mb-3"
              >
                验证
              </button>
              <button
                onClick={handleBack}
                className="w-full text-sm text-forest-400 hover:text-forest-600 transition-colors"
              >
                更换手机号
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
