import { useContext, useEffect, useRef, useState } from 'react';
import PeerContext from '../../context/PeerContext';
import { toast } from 'react-toastify';

const CallModal = ({ user }) => {
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [second, setSecond] = useState(0);
  const [total, setTotal] = useState(0);

  const [answer, setAnswer] = useState(false);
  const [newCall, setNewCall] = useState(null);
  const localStream = useRef();

  const {
    peer,
    showCallModal: call,
    setCallModal,
    socket,
  } = useContext(PeerContext);

  // Set Time
  useEffect(() => {
    const setTime = () => {
      setTotal((t) => t + 1);
      setTimeout(setTime, 1000);
    };
    setTime();

    return () => setTotal(0);
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
      setTotal(0);
    } else {
      const timer = setTimeout(() => {
        localStream.current &&
          localStream.current.getTracks().forEach((track) => track.stop());
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

  const answerCall = () => {
    if (!navigator.mediaDevices) {
      newCall && newCall.close();
      setCallModal(null);
      return toast.error('Cannot open audio stream');
    }

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        const c = peer.current.call(call.peerId, stream);

        localStream.current = stream;

        c.on('stream', (remoteStream) => {
          showStream(remoteStream);
        });

        setAnswer(true);
        setNewCall(c);
      })
      .catch(() => {
        newCall && newCall.close();
        setCallModal(null);
        toast.error('Error opening stream');
      });
  };

  const endCall = () => {
    localStream.current &&
      localStream.current.getTracks().forEach((track) => track.stop());
    if (newCall) {
      newCall.close();
    }

    socket.current.emit('endCall', call);
    setCallModal(null);
  };

  useEffect(() => {
    peer.current.on('call', (newCall) => {
      if (!navigator.mediaDevices) {
        newCall && newCall.close();
        setCallModal(null);
        return toast.error('Cannot open audio stream');
      }

      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          newCall.answer(stream);
          localStream.current = stream;

          newCall.on('stream', (remoteStream) => {
            showStream(remoteStream);
          });

          setAnswer(true);
          setNewCall(newCall);
        })
        .catch(() => {
          newCall && newCall.close();
          setCallModal(null);
          toast.error('Error opening stream');
        });
    });
  }, [peer.current]);

  useEffect(() => {
    socket.current.off('endCallToClient').on('endCallToClient', () => {
      localStream.current &&
        localStream.current.getTracks().forEach((track) => track.stop());
      if (newCall) newCall.close();
      setCallModal(null);
    });
  }, [socket.current, peer.current]);

  useEffect(() => {
    socket.current.off('callerDisconnected').on('callerDisconnected', () => {
      localStream.current &&
        localStream.current.getTracks().forEach((track) => track.stop());

      newCall && newCall.close();
      setCallModal(null);
    });
  }, [socket.current]);

  return (
    <div className='call_modal'>
      <div className='call_box flex flex-col items-center justify-center'>
        <div
          className='text-center flex items-center justify-center flex-col gap-3'
          style={{ padding: '40px 0' }}
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

        <div className='w-md shadow-lg mt-3 w-full flex flex-col gap-2 items-center justify-center'>
          {call.recipient === user._id && !answer && (
            <>
              <button
                className='material-icons text-success bg-buttonHover w-32 px-4 py-3 rounded-md'
                onClick={answerCall}
              >
                Answer
              </button>
            </>
          )}
          <button
            className='material-icons text-danger bg-dark w-32 px-4 py-3 rounded-md'
            onClick={endCall}
          >
            End call
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
