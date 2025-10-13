import React from 'react';
import './Footer.css';

const Footer = () => (
    <footer className="footer">
        <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} BookShopAI.</p>
        </div>
    </footer>
);

export default Footer;