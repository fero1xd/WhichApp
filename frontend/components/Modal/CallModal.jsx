import { useContext, useEffect, useRef, useState } from 'react';
import PeerContext from '../../context/PeerContext';
import { toast } from 'react-toastify';
import { BsMic, BsMicMute } from 'react-icons/bs';

const CallModal = ({ user }) => {
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [second, setSecond] = useState(0);
  const [total, setTotal] = useState(0);

  const [answer, setAnswer] = useState(false);
  const [newCall, setNewCall] = useState(null);
  // const [localStream, setLocalStream] = useState();
  const localStream = useRef();

  const [isMicEnabled, setMicEnabled] = useState(true);
  const {
    peer,
    showCallModal: call,
    setCallModal,
    socket,
  } = useContext(PeerContext);

  // Ringtone
  const audioRef = useRef();
  const hasStartedPlaying = useRef(false);

  useEffect(() => {
    if (call.recipient === user._id && !hasStartedPlaying.current) {
      audioRef.current.play();
      audioRef.current.loop = true;
      hasStartedPlaying.current = true;
    }
  }, []);

  // Set Time
  useEffect(() => {
    const interval = setInterval(() => {
      setTotal((t) => t + 1);
    }, 1000);

    return () => {
      setTotal(0);
      clearInterval(interval);
    };
  }, []);

  // set time
  useEffect(() => {
    setSecond(total % 60);
    setMins(parseInt(total / 60));
    setHours(parseInt(total / 3600));
  }, [total]);

  // handle timeout
  useEffect(() => {
    if (answer) {
      console.log('hello');

      audioRef.current.pause();
      audioRef.current.loop = false;

      setTotal(0);
    } else {
      const timer = setTimeout(() => {
        if (localStream.current) {
          localStream.current.getTracks().forEach((t) => t.stop());
        }
        socket.current.emit('endCall', call);
        setCallModal(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [answer, call]);

  const showStream = (stream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
  };

  const answerCall = async () => {
    if (!navigator.mediaDevices) {
      newCall && newCall.close();
      setCallModal(null);
      return toast.error('Cannot open audio stream');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      localStream.current = stream;
      const c = peer.current.call(call.peerId, stream);

      c.on('stream', (remoteStream) => {
        showStream(remoteStream);
      });

      setAnswer(true);
      setNewCall(c);
    } catch (e) {
      newCall && newCall.close();
      setCallModal(null);
      toast.error(
        'There was a problem using your microhpone. Please try again later'
      );

      endCall();
    }
  };

  const endCall = () => {
    if (localStream.current) {
      console.log('stopping stream');
      localStream.current.getTracks()[0].stop();
    }
    if (newCall) {
      newCall.close();
    }

    socket.current.emit('endCall', call);
    setCallModal(null);
  };

  // Call use effect
  useEffect(() => {
    if (!peer.current) return;

    peer.current.off('call').on('call', async (newCall) => {
      if (!navigator.mediaDevices) {
        newCall && newCall.close();
        setCallModal(null);
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
        setCallModal(null);
        toast.error(
          'There was a problem using your microhpone. Please try again later'
        );

        endCall();
      }
    });
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.off('endCallToClient').on('endCallToClient', () => {
      console.log('endCallToClient');
      if (localStream.current) {
        console.log('stopping stream');
        localStream.current.getTracks()[0].stop();
      }
      if (newCall) newCall.close();
      setCallModal(null);
    });
  }, [socket.current]);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.off('callerDisconnected').on('callerDisconnected', () => {
      console.log('dc');
      if (localStream.current) {
        console.log('stopping stream');
        localStream.current.getTracks()[0].stop();
      }

      newCall && newCall.close();
      setCallModal(null);
    });
  }, [socket.current]);

  const toggleMic = () => {
    if (!localStream.current) return;
    setMicEnabled((prev) => {
      localStream.current.getAudioTracks()[0].enabled = !prev;
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
              call.recipient === user._id
                ? call.profilePicUrl
                : call.recipientProfilePicUrl
            }
            className='w-14 h-14 rounded-full'
          />
          <h4>
            {call.recipient === user._id ? call.name : call.recipientName}
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

        {call.recipient === user._id && !answer && (
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
