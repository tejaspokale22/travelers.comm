import React, { useEffect } from 'react';
import Login from '../components/Login';
import Contain from '../components/container/Contain';

function LoginPage() {
  return (
    <>
      <div className='flex items-center w-full bg-gray-800 min-h-[32rem]'>
        <Contain>
          <div className='flex justify-center'>
            <Login />
          </div>
        </Contain>
      </div>
    </>
  );
}

export default LoginPage;
