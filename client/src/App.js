import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';

const socket = io("https://ubiquitous-journey-g4xxwwrq6pv52pg9g-5000.app.github.dev/",{transports:['websocket']});
const peer = new Peer();

function App() {
  const myVideo = useRef();
  const userVideo = useRef();
  const userStream = useRef();
  const [isCallStarted, setIsCallStarted] = useState(false);
  const roomId = '1'; 
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        myVideo.current.srcObject = stream;
        userStream.current = stream;

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            userVideo.current.srcObject = remoteStream;
          });
        });
      })
      .catch(err => {
        console.error("Error accessing media devices.", err);
      });

    socket.on('user-connected', (userId) => {
      if (isCallStarted) {
        const call = peer.call(userId, userStream.current);
        call.on('stream', (remoteStream) => {
          userVideo.current.srcObject = remoteStream;
        });
      }
    });

    return () => {
      socket.off('user-connected');
    };
  }, [isCallStarted]);

  const startCall = () => {
    socket.emit('join-room', roomId, peer.id);
    setIsCallStarted(true);
  };

  return (
    <div>
      <h1>web App</h1>
      <button onClick={startCall} disabled={isCallStarted}>
        {isCallStarted ? 'Call Started' : 'Start Call'}
      </button>
      <div style={{ display: 'flex', gap: '10px' }}>
        <video ref={myVideo} autoPlay muted style={{ width: '300px' }} />
        <video ref={userVideo} autoPlay style={{ width: '300px' }} />
      </div>
    </div>
  );
}

export default App;
