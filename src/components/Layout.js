import React from "react";
import s from '../scss/components/Layout.module.scss'
import Header from '../components/Header';
import Navbar from '../components/Navbar';

const Layout = ({ navType, children }) => {
  return (
    <>
      <Header />
      <div className='d-flex'>
        <Navbar navType={navType} />
        <div className={s.layout}>
          {children}
        </div >
      </div >
    </>
  );
};

export default Layout;