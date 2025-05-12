import React, { useState, useEffect } from 'react';

const MobileDeviceAlert: React.FC = () => {
  const [language, setLanguage] = useState<'th' | 'en'>('en');

  // ล็อกการเลื่อนหน้าจอเมื่อ component ถูกแสดง
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // คืนค่าเดิมเมื่อ component ถูกลบ
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const content = {
    th: {
      title: 'แจ้งเตือนความปลอดภัย',
      message: 'ระบบไม่รองรับการใช้งานผ่านอุปกรณ์มือถือตามนโยบายความปลอดภัย กรุณาใช้งานผ่านคอมพิวเตอร์หรือแล็ปท็อปเพื่อประสิทธิภาพและความปลอดภัยสูงสุด',
      note: 'เพื่อความปลอดภัยของข้อมูลและการทำงานที่แม่นยำ ระบบจะไม่อนุญาตให้เข้าถึงผ่านอุปกรณ์มือถือ'
    },
    en: {
      title: 'Security Alert',
      message: 'This system does not support mobile devices due to security policies. Please use a computer or laptop for optimal performance and maximum security.',
      note: 'For data security and operational accuracy, the system will not allow access via mobile devices'
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0,
      margin: 0,
      width: '100vw',
      height: '100vh',
      touchAction: 'none'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        margin: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1rem'
        }}>
          <button
            onClick={() => setLanguage(lang => lang === 'th' ? 'en' : 'th')}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#64748b',
              transition: 'all 0.2s ease'
            }}
          >
            {language === 'th' ? 'EN' : 'TH'}
          </button>
        </div>
        
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '24px'
        }}>
          ⚠️
        </div>

        <h3 style={{
          color: '#dc2626',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          lineHeight: '1.3'
        }}>
          {content[language].title}
        </h3>

        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#334155',
          marginBottom: '1.5rem',
          fontWeight: '400'
        }}>
          {content[language].message}
        </p>

        <p style={{
          fontSize: '0.875rem',
          color: '#64748b',
          fontStyle: 'italic',
          lineHeight: '1.5'
        }}>
          {content[language].note}
        </p>
      </div>
    </div>
  );
};

export default MobileDeviceAlert; 