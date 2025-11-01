// import React from 'react';
// import './Footer.css';

// const Footer = () => (
//     <footer className="footer">
//         <div className="footer-content">
//             <p>&copy; {new Date().getFullYear()} BookShopAI.</p>
//         </div>
//     </footer>
// );

// export default Footer;



import React, { useEffect, useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Hiện nút khi cuộn quá 300px
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    // Hỗ trợ “prefers-reduced-motion” tự động trong CSS, nhưng vẫn smooth mặc định
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          {/* Nếu bạn có link/social thì thêm vào 2 khối dưới đây */}
          {/* <div className="footer-links">...</div> */}
          {/* <div className="footer-social">...</div> */}

          <p className="footer-copy">
            &copy; {new Date().getFullYear()} BookShopAI.
          </p>
        </div>
      </footer>

      {/* Nút On Top (floating), gắn chung trong Footer component */}
      <button
        className={`back-to-top ${showTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Lên đầu trang"
      >
        {/* SVG mũi tên lên trên, không cần thư viện icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4l-7 7h4v9h6v-9h4z" fill="currentColor" />
        </svg>
      </button>
    </>
  );
};

export default Footer;
