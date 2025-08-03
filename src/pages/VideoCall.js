import React, { useEffect, useRef, useContext, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../SocketContext';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
} from 'lucide-react';
import './VideoCall.css';
import axios from 'axios';

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');

  const socket = useContext(SocketContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const navigate = useNavigate();

  const [isCallStarted, setIsCallStarted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const timerRef = useRef(null);

  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  // ✅ Check subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data.isPremium) {
          alert('Video call is a premium feature. Please subscribe to access it.');
          navigate('/subscription');
        }
      } catch (err) {
        console.error('Failed to check premium status:', err);
        alert('Error checking subscription status. Redirecting to dashboard.');
        navigate('/dashboard');
      }
    };

    checkSubscription();
  }, [navigate]);

  useEffect(() => {
    if (!userId) {
      alert('Missing call user. Returning to chats.');
      navigate('/chats');
      return;
    }

    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    const startMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        localStream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStream);
        });
      } catch (err) {
        console.error('Failed to get local media:', err);
      }
    };

    startMedia();

    peerConnection.current.onnegotiationneeded = async () => {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('offer', {
        to: userId,
        offer,
      });
      setIsCallStarted(true);
      startCallTimer();
    };

    socket.on('answer', async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      startCallTimer();
    });

    socket.on('offer', async ({ from, offer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answer', { to: from, answer });
      setIsCallStarted(true);
      startCallTimer();
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding ice candidate', e);
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      cleanupCall();
    };
  }, [userId, socket, navigate]);

  const cleanupCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }
    clearInterval(timerRef.current);
  };

  const endCall = () => {
    setIsEnding(true);
    cleanupCall();
    setTimeout(() => {
      navigate('/chats');
    }, 500);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`video-call-container ${isEnding ? 'fade-out' : ''}`}>
      <h2>{isCallStarted ? `In Call with ${userName}` : `Calling ${userName}...`}</h2>
      <div className="call-timer">⏱ {formatDuration(callDuration)}</div>

      <div className="video-wrapper">
        <video ref={localVideoRef} autoPlay muted playsInline className="video-local" />
        <video ref={remoteVideoRef} autoPlay playsInline className="video-remote" />
      </div>

      <div className="floating-controls">
        <button onClick={toggleMute} className={`control-button ${isMuted ? 'muted' : ''}`}>
          {isMuted ? <MicOff size={26} /> : <Mic size={26} />}
        </button>
        <button onClick={toggleCamera} className={`control-button ${isCameraOff ? 'off' : ''}`}>
          {isCameraOff ? <CameraOff size={26} /> : <Camera size={26} />}
        </button>
        <button onClick={endCall} className="control-button end">
          <PhoneOff size={26} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
