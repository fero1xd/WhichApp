import { useContext, useEffect, useRef, useState } from 'react';
import PeerSocketContext from '../../context/PeerSocketContext';
import { toast } from 'react-toastify';
import { BsMic, BsMicMute } from 'react-icons/bs';
import { User } from '../../utils/types';
import { NextPage } from 'next';
import { createRef } from 'react';
import { MediaConnection } from 'peerjs';

type CallModalProps = {
  user: User;
};

const CallModal: NextPage<CallModalProps> = ({ user }) => {
  // Time related states
  const [hours, setHours] = useState<number>(0);
  const [mins, setMins] = useState<number>(0);
  const [second, setSecond] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Call related state
  const [answer, setAnswer] = useState(false);
  const [newCall, setNewCall] = useState<MediaConnection>();
  const localStream = useRef<MediaStream>();
  const [isMicEnabled, setMicEnabled] = useState(true);
  const {
    peer,
    showCallModal: call,
    setCallModal,
    socket,
  } = useContext(PeerSocketContext);

  // Ringtone
  const audioRef = createRef<HTMLAudioElement>();
  const hasStartedPlaying = useRef(false);

  // Ringtone effect
  useEffect(() => {
    if (call!.recipient === user._id && !hasStartedPlaying.current) {
      audioRef.current?.play();
      audioRef.current && (audioRef.current.loop = true);
      hasStartedPlaying.current = true;
    }
  }, []);

  // Set Time effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTotal((t) => t + 1);
    }, 1000);

    return () => {
      setTotal(0);
      clearInterval(interval);
    };
  }, []);

  // Increase time
  useEffect(() => {
    setSecond(total % 60);
    setMins(~~(total / 60));
    setHours(~~(total / 3600));
  }, [total]);

  // handle timeout
  useEffect(() => {
    if (answer) {
      audioRef.current?.pause();
      audioRef.current && (audioRef.current.loop = false);
      setTotal(0);
    } else {
      const timer = setTimeout(() => {
        if (localStream.current) {
          localStream.current.getTracks().forEach((t) => t.stop());
        }
        socket?.emit('endCall', call);
        setCallModal!(undefined);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [answer, call]);

  const showStream = (stream: MediaStream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
  };

  const answerCall = async () => {
    if (!peer || !call) return;

    if (!navigator.mediaDevices) {
      newCall && newCall.close();
      setCallModal!(undefined);
      return toast.error('Cannot open audio stream');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      localStream.current = stream;
      const c = peer.call(call.peerId, stream);

      c.on('stream', (remoteStream) => {
        showStream(remoteStream);
      });

      setAnswer(true);
      setNewCall(c);
    } catch (e) {
      newCall && newCall.close();
      setCallModal!(undefined);
      toast.error(
        'There was a problem using your microhpone. Please try again later'
      );

      endCall();
    }
  };

  const endCall = () => {
    if (!socket) return;

    if (localStream.current) {
      console.log('stopping stream');
      localStream.current.getTracks()[0].stop();
    }
    if (newCall) {
      newCall.close();
    }

    socket.emit('endCall', call);
    setCallModal!(undefined);
  };

  // Call use effect
  useEffect(() => {
    if (!peer) return;

    peer.off('call').on('call', async (newCall) => {
      if (!navigator.mediaDevices) {
        newCall && newCall.close();
        setCallModal!(undefined);
        return toast.error('Cannot open audio stream');
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStream.current = stream;

        newCall.answer(stream);

        newCall.on('stream', (remoteStream) => {
          showStream(remoteStream);
        });

        setAnswer(true);
        setNewCall(newCall);
      } catch (e) {
        newCall && newCall.close();
        setCallModal!(undefined);
        toast.error(
          'There was a problem using your microhpone. Please try again later'
        );

        endCall();
      }
    });
  }, [peer]);

  useEffect(() => {
    if (!socket) return;

    socket.off('endCallToClient').on('endCallToClient', () => {
      console.log('endCallToClient');
      if (localStream.current) {
        console.log('stopping stream');
        localStream.current.getTracks()[0].stop();
      }
      if (newCall) newCall.close();
      setCallModal!(undefined);
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.off('callerDisconnected').on('callerDisconnected', () => {
      console.log('dc');
      if (localStream.current) {
        console.log('stopping stream');
        localStream.current.getTracks()[0].stop();
      }

      newCall && newCall.close();
      setCallModal!(undefined);
    });
  }, [socket]);

  const toggleMic = () => {
    if (!localStream.current) return;

    setMicEnabled((prev) => {
      localStream.current!.getAudioTracks()[0].enabled = !prev;
      return !prev;
    });
  };

  return (
    <div className='call_modal'>
      <audio ref={audioRef} className='hidden' src='/nudge.mp3'></audio>
      <div className='call_box'>
        <div
          className='text-center flex items-center justify-center flex-col gap-3'
          style={{ padding: '30px 0' }}
        >
          <img
            src={
              call!.recipient === user._id
                ? call!.profilePicUrl
                : call!.recipientProfilePicUrl
            }
            className='w-14 h-14 rounded-full object-cover'
          />
          <h4>
            {call!.recipient === user._id ? call!.name : call!.recipientName}
          </h4>

          {answer ? (
            <div>
              <span>{hours.toString().length < 2 ? '0' + hours : hours}</span>
              <span>:</span>
              <span>{mins.toString().length < 2 ? '0' + mins : mins}</span>
              <span>:</span>
              <span>
                {second.toString().length < 2 ? '0' + second : second}
              </span>
            </div>
          ) : (
            <div className='animate-pulse'>.........</div>
          )}
        </div>

        {!answer && (
          <div className='timer'>
            <small>{mins.toString().length < 2 ? '0' + mins : mins}</small>
            <small>:</small>
            <small>
              {second.toString().length < 2 ? '0' + second : second}
            </small>
          </div>
        )}

        {answer && (
          <div className='mb-5'>
            {isMicEnabled ? (
              <BsMic cursor='pointer' onClick={toggleMic} className='w-8 h-8' />
            ) : (
              <BsMicMute
                cursor='pointer'
                onClick={toggleMic}
                className='w-8 h-8'
              />
            )}
          </div>
        )}

        {call!.recipient === user._id && !answer && (
          <>
            <button
              className='mt-3 w-full material-icons shadow-xl text-success bg-buttonHover px-4 py-3 rounded-md'
              onClick={answerCall}
            >
              Answer
            </button>
          </>
        )}
        <button
          className='w-full material-icons text-danger bg-dark px-4 py-3 rounded-md mt-2'
          onClick={endCall}
        >
          End call
        </button>
      </div>
    </div>
  );
};

export default CallModal;
