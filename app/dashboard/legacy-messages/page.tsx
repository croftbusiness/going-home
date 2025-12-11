'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Plus, Trash2, Play, Upload, Camera, Mic, X, ArrowLeft, Check, FileVideo, FileAudio, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LegacyMessage {
  id?: string;
  messageType: string;
  title: string;
  recipientType?: string;
  recipientId?: string;
  recipientName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  durationSeconds?: number;
  description?: string;
  playOnDate?: string;
  releaseType?: 'after_death' | 'on_date' | 'immediate';
  releaseDate?: string;
}

interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
}

const MESSAGE_TYPES = [
  { value: 'video', label: 'Video Message', icon: Video },
  { value: 'audio', label: 'Audio Message', icon: Mic },
];

const RECIPIENT_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'children', label: 'Children' },
  { value: 'specific_person', label: 'Specific Person' },
  { value: 'general', label: 'General' },
];

export default function LegacyMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<LegacyMessage[]>([]);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputMode, setInputMode] = useState<'record' | 'upload'>('record'); // New state for mode selection
  const [formData, setFormData] = useState<LegacyMessage>({
    messageType: 'video',
    title: '',
    recipientType: 'family',
    recipientId: '',
    recipientName: '',
    description: '',
    playOnDate: '',
    releaseType: 'after_death',
    releaseDate: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stream]);

  const loadData = async () => {
    try {
      const [messagesRes, contactsRes] = await Promise.all([
        fetch('/api/user/legacy-messages'),
        fetch('/api/user/trusted-contacts'),
      ]);

      if (!messagesRes.ok) {
        if (messagesRes.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load messages');
      }

      const messagesData = await messagesRes.json();
      setMessages(messagesData.messages || []);

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        const contactsList = contactsData.contacts || contactsData.trustedContacts || [];
        setContacts(contactsList);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      
      if (formData.messageType === 'video') {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        
        setStream(videoStream);
        
        // Set up video element to show preview
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
        
        const recorder = new MediaRecorder(videoStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
        });
        
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setRecordedBlob(blob);
          setSelectedFile(new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' }));
        };
        
        recorder.start();
        setMediaRecorder(recorder);
      } else {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
        
        const recorder = new MediaRecorder(audioStream, {
          mimeType: 'audio/webm',
        });
        
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setRecordedBlob(blob);
          setSelectedFile(new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' }));
        };
        
        recorder.start();
        setMediaRecorder(recorder);
      }
      
      // Start recording state and timer for both video and audio
      setIsRecording(true);
      setRecordingTime(0);
      
      // Clear any existing interval first
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      // Update recording time every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError('Failed to access camera/microphone: ' + err.message);
      console.error('Recording error:', err);
      // Clean up on error
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRecordedBlob(null);
      // Auto-detect message type from file
      if (file.type.startsWith('video/')) {
        setFormData({ ...formData, messageType: 'video' });
      } else if (file.type.startsWith('audio/')) {
        setFormData({ ...formData, messageType: 'audio' });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) {
      setError('Please record/select a file and enter a title');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload file
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/user/legacy-messages/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Save message record
      const messageData = {
        ...formData,
        fileUrl: uploadData.fileUrl,
        fileSize: uploadData.fileSize,
        mimeType: uploadData.mimeType,
      };

      const saveResponse = await fetch('/api/user/legacy-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save message');
      }

      await loadData();
      setShowAddForm(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to upload message');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      messageType: 'video',
      title: '',
      recipientType: 'family',
      recipientId: '',
      recipientName: '',
      description: '',
      playOnDate: '',
      releaseType: 'after_death',
      releaseDate: '',
    });
    setSelectedFile(null);
    setRecordedBlob(null);
    setInputMode('record');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/user/legacy-messages?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7]">
        <div className="text-[#2C2A29] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F7] via-[#FCFAF7] to-[#FAF9F7]">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Link href="/dashboard" className="p-2 hover:bg-gray-50 rounded-xl transition-colors flex-shrink-0">
                <ArrowLeft className="w-5 h-5 text-[#2C2A29]" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-2 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#2C2A29]">Legacy Messages</h1>
                </div>
                <p className="text-xs sm:text-sm text-[#2C2A29] opacity-60">
                  Preserve your voice and presence for loved ones
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm sm:text-base font-semibold touch-target transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>Create Message</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base shadow-sm">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Create New Message</h2>
                  <p className="text-white/90 text-sm">Share your thoughts with those who matter most</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-target"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Message Type Selection - Premium Cards */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2A29] mb-3">
                  Message Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MESSAGE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.messageType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          if (!isRecording) {
                            setFormData({ ...formData, messageType: type.value });
                            setSelectedFile(null);
                            setRecordedBlob(null);
                          }
                        }}
                        disabled={isRecording}
                        className={`p-4 rounded-xl border-2 transition-all touch-target ${
                          isSelected
                            ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        } ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Mode Selection - Record or Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2A29] mb-3">
                  How would you like to add your {formData.messageType === 'video' ? 'video' : 'audio'}? *
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isRecording) {
                        setInputMode('record');
                        setSelectedFile(null);
                        setRecordedBlob(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isRecording}
                    className={`p-4 rounded-xl border-2 transition-all touch-target ${
                      inputMode === 'record'
                        ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {formData.messageType === 'video' ? (
                      <Camera className={`w-6 h-6 mx-auto mb-2 ${inputMode === 'record' ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                    ) : (
                      <Mic className={`w-6 h-6 mx-auto mb-2 ${inputMode === 'record' ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                    )}
                    <span className={`text-sm font-medium ${inputMode === 'record' ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                      Record Now
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isRecording) {
                        setInputMode('upload');
                        setRecordedBlob(null);
                        if (stream) {
                          stream.getTracks().forEach(track => track.stop());
                          setStream(null);
                        }
                        if (videoRef.current) videoRef.current.srcObject = null;
                        fileInputRef.current?.click();
                      }
                    }}
                    disabled={isRecording}
                    className={`p-4 rounded-xl border-2 transition-all touch-target ${
                      inputMode === 'upload'
                        ? 'border-[#A5B99A] bg-gradient-to-br from-[#A5B99A]/10 to-[#93B0C8]/10 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    } ${isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {formData.messageType === 'video' ? (
                      <FileVideo className={`w-6 h-6 mx-auto mb-2 ${inputMode === 'upload' ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                    ) : (
                      <FileAudio className={`w-6 h-6 mx-auto mb-2 ${inputMode === 'upload' ? 'text-[#A5B99A]' : 'text-gray-400'}`} />
                    )}
                    <span className={`text-sm font-medium ${inputMode === 'upload' ? 'text-[#2C2A29]' : 'text-gray-600'}`}>
                      Upload File
                    </span>
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={formData.messageType === 'video' ? 'video/*' : 'audio/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Recording Section */}
                {inputMode === 'record' && (
                  <div className="space-y-4">
                    {!isRecording && !recordedBlob && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 sm:p-12 text-center border-2 border-dashed border-gray-300">
                        {formData.messageType === 'video' ? (
                          <>
                            <div className="w-20 h-20 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Camera className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">Ready to Record</h3>
                            <p className="text-sm text-[#2C2A29] opacity-70 mb-6">
                              Press the button below to start recording your video message
                            </p>
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full max-w-md mx-auto rounded-xl mb-4 bg-black shadow-lg"
                              style={{ display: stream ? 'block' : 'none', maxHeight: '300px' }}
                            />
                            {!stream && (
                              <button
                                onClick={startRecording}
                                className="px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-3 mx-auto touch-target font-semibold text-base transform hover:scale-105"
                              >
                                <Camera className="w-6 h-6" />
                                <span>Start Recording</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Mic className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">Ready to Record</h3>
                            <p className="text-sm text-[#2C2A29] opacity-70 mb-6">
                              Press the button below to start recording your audio message
                            </p>
                            <audio ref={audioRef} autoPlay className="w-full mb-4 max-w-md mx-auto" />
                            <button
                              onClick={startRecording}
                              className="px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-3 mx-auto touch-target font-semibold text-base transform hover:scale-105"
                            >
                              <Mic className="w-6 h-6" />
                              <span>Start Recording</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {isRecording && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 sm:p-8 text-center border-2 border-red-300 shadow-lg">
                        <div className="flex items-center justify-center space-x-3 mb-6">
                          <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-lg" />
                          <span className="text-xl sm:text-2xl font-bold text-red-700">
                            Recording: {formatTime(recordingTime)}
                          </span>
                        </div>
                        {formData.messageType === 'video' && (
                          <div className="mb-6">
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              playsInline
                              className="w-full max-w-md mx-auto rounded-xl bg-black shadow-2xl"
                              style={{ maxHeight: '400px', display: stream ? 'block' : 'none' }}
                            />
                            {!stream && (
                              <div className="w-full max-w-md mx-auto h-64 bg-black rounded-xl flex items-center justify-center">
                                <div className="text-white">Starting camera...</div>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={stopRecording}
                          className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center space-x-3 mx-auto touch-target font-semibold text-base shadow-lg transform hover:scale-105"
                        >
                          <div className="w-5 h-5 bg-white rounded-sm" />
                          <span>Stop Recording</span>
                        </button>
                      </div>
                    )}

                    {recordedBlob && !isRecording && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-green-800">Recording Complete</p>
                              <p className="text-xs text-green-600">Duration: {formatTime(recordingTime)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setRecordedBlob(null);
                              setSelectedFile(null);
                            }}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium touch-target"
                          >
                            Delete
                          </button>
                        </div>
                        {formData.messageType === 'video' ? (
                          <video
                            src={URL.createObjectURL(recordedBlob)}
                            controls
                            className="w-full rounded-xl bg-black shadow-lg"
                            style={{ maxHeight: '300px' }}
                          />
                        ) : (
                          <audio
                            src={URL.createObjectURL(recordedBlob)}
                            controls
                            className="w-full rounded-lg"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Section */}
                {inputMode === 'upload' && (
                  <div className="space-y-4">
                    {!selectedFile && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 sm:p-12 text-center border-2 border-dashed border-gray-300">
                        {formData.messageType === 'video' ? (
                          <>
                            <div className="w-20 h-20 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <FileVideo className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">Upload Video File</h3>
                            <p className="text-sm text-[#2C2A29] opacity-70 mb-6">
                              Select a video file from your device
                            </p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="px-8 py-4 bg-white border-2 border-[#A5B99A] text-[#2C2A29] rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 mx-auto touch-target font-semibold text-base shadow-md transform hover:scale-105"
                            >
                              <Upload className="w-6 h-6" />
                              <span>Choose Video File</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <FileAudio className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#2C2A29] mb-2">Upload Audio File</h3>
                            <p className="text-sm text-[#2C2A29] opacity-70 mb-6">
                              Select an audio file from your device
                            </p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="px-8 py-4 bg-white border-2 border-[#A5B99A] text-[#2C2A29] rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 mx-auto touch-target font-semibold text-base shadow-md transform hover:scale-105"
                            >
                              <Upload className="w-6 h-6" />
                              <span>Choose Audio File</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {selectedFile && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {formData.messageType === 'video' ? (
                              <FileVideo className="w-8 h-8 text-blue-600" />
                            ) : (
                              <FileAudio className="w-8 h-8 text-blue-600" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-blue-800">{selectedFile.name}</p>
                              <p className="text-xs text-blue-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium touch-target"
                          >
                            Remove
                          </button>
                        </div>
                        {formData.messageType === 'video' && selectedFile.type.startsWith('video/') && (
                          <video
                            src={URL.createObjectURL(selectedFile)}
                            controls
                            className="w-full rounded-xl bg-black shadow-lg mt-4"
                            style={{ maxHeight: '300px' }}
                          />
                        )}
                        {formData.messageType === 'audio' && selectedFile.type.startsWith('audio/') && (
                          <audio
                            src={URL.createObjectURL(selectedFile)}
                            controls
                            className="w-full rounded-lg mt-4"
                          />
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#2C2A29] opacity-60 text-center">
                      Maximum file size: 100MB • Supported formats: {formData.messageType === 'video' ? 'MP4, WebM, MOV' : 'MP3, WAV, WebM'}
                    </p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all touch-target"
                  placeholder="e.g., A Message for My Children"
                  disabled={isRecording}
                />
              </div>

              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                  Who is this for? *
                </label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value, recipientId: '', recipientName: '' })}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all touch-target"
                  disabled={isRecording}
                >
                  {RECIPIENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Person Selection */}
              {formData.recipientType === 'specific_person' && contacts.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                    Select Recipient *
                  </label>
                  <select
                    value={formData.recipientId}
                    onChange={(e) => {
                      const contact = contacts.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        recipientId: e.target.value,
                        recipientName: contact?.name || '',
                      });
                    }}
                    className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all touch-target"
                    disabled={isRecording}
                  >
                    <option value="">Select a contact...</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Release Timing */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                  When should this be released? *
                </label>
                <select
                  value={formData.releaseType}
                  onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as any, releaseDate: '' })}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all touch-target"
                  disabled={isRecording}
                >
                  <option value="after_death">After I Pass Away</option>
                  <option value="on_date">On a Specific Date</option>
                  <option value="immediate">Immediately Available</option>
                </select>
              </div>

              {/* Release Date */}
              {formData.releaseType === 'on_date' && (
                <div>
                  <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                    Release Date *
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all touch-target"
                    disabled={isRecording}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2A29] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A5B99A] focus:border-[#A5B99A] transition-all resize-none"
                  placeholder="Add any notes or context about this message..."
                  disabled={isRecording}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !formData.title.trim() || isRecording || (formData.recipientType === 'specific_person' && !formData.recipientId)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base touch-target font-semibold transform hover:scale-105 disabled:transform-none"
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploading ? 'Uploading...' : 'Save Message'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  disabled={isRecording || uploading}
                  className="flex-1 sm:flex-initial px-6 py-4 text-[#2C2A29] bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base touch-target font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.length === 0 && !showAddForm ? (
          <div className="bg-white rounded-2xl p-12 sm:p-16 text-center border border-gray-100 shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Video className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2C2A29] mb-3">No Messages Yet</h3>
            <p className="text-[#2C2A29] opacity-70 mb-8 text-base sm:text-lg max-w-md mx-auto">
              Create meaningful video or audio messages that will be treasured by your loved ones
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] text-white rounded-xl hover:shadow-xl transition-all touch-target font-semibold text-base transform hover:scale-105"
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Create Your First Message</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-xl p-5 sm:p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-[#A5B99A] to-[#93B0C8] rounded-lg group-hover:scale-110 transition-transform">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#2C2A29] capitalize bg-gray-50 px-3 py-1 rounded-full">
                      {message.messageType}
                    </span>
                  </div>
                  <button
                    onClick={() => message.id && handleDelete(message.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors touch-target opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#2C2A29] mb-2">{message.title}</h3>
                {message.description && (
                  <p className="text-sm text-[#2C2A29] opacity-70 mb-4 line-clamp-2">{message.description}</p>
                )}
                {message.fileUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden shadow-md">
                    {message.messageType === 'video' ? (
                      <video
                        src={message.fileUrl}
                        controls
                        className="w-full"
                        style={{ maxHeight: '300px' }}
                      />
                    ) : (
                      <div className="bg-gradient-to-r from-[#A5B99A] to-[#93B0C8] p-4">
                        <audio src={message.fileUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                )}
                {message.releaseType && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#A5B99A] rounded-full" />
                      <p className="text-xs text-[#2C2A29] opacity-60 font-medium">
                        {message.releaseType === 'after_death' 
                          ? 'Released after passing' 
                          : message.releaseType === 'on_date' && message.releaseDate 
                          ? `Releases ${new Date(message.releaseDate).toLocaleDateString()}`
                          : 'Available now'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
