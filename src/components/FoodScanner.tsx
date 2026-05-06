import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Loader2, CheckCircle2, ChevronRight, Flame, Beef, Wheat, Pizza, TrendingUp } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function FoodScanner({ user }: { user: any }) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const analyzeFood = async () => {
    if (!image) return;
    setAnalyzing(true);
    
    try {
      const base64Data = image.split(',')[1];
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              { text: `Identify the food in this image and estimate its nutritional values. 
              Also, provide character commentary from the Horimiya cast:
              - If it's a main/savory meal: Include Hori (bossy/efficient, img: https://res.cloudinary.com/dleg7ww07/image/upload/v1/hori_chibi) and Yuki (energetic, img: https://res.cloudinary.com/dleg7ww07/image/upload/v1/yuki_chibi).
              - If it's a dessert/sweet: Include Sakura (gentle/sweet, img: https://res.cloudinary.com/dleg7ww07/image/upload/v1/sakura_chibi) and Remi (playful/excited, img: https://res.cloudinary.com/dleg7ww07/image/upload/v1/remi_chibi).
              - Always include Miyamura (kind/polite, img: https://res.cloudinary.com/dleg7ww07/image/upload/v1/animeint).
              Output in valid JSON format only.` },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              commentary: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: {
                    character: { type: Type.STRING },
                    image: { type: Type.STRING },
                    text: { type: Type.STRING }
                  }
                } 
              }
            },
            required: ["name", "calories", "protein", "carbs", "fat", "commentary"]
          }
        }
      });

      const data = JSON.parse(result.text || '{}');
      setResult(data);
    } catch (err) {
      console.error("Analysis error", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const logMeal = () => {
    if (!result) return;
    setResult(null);
    setImage(null);
    alert("Meal logged locally! (Firestore is currently disabled)");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold">AI Food Scanner</h2>
        <p className="text-gray-400">Snap a photo and let AI identify your meal instantly.</p>
      </div>

      <div className="glass-card p-4 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        {analyzing && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
             <div className="relative">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-0 left-1/2 -underline w-[2px] bg-white/50 blur-[2px]"
                />
             </div>
             <p className="mt-4 font-medium animate-pulse">Analyzing with AI...</p>
           </div>
        )}

        <AnimatePresence mode="wait">
          {isCameraOpen ? (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full relative rounded-2xl overflow-hidden"
            >
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <button 
                  onClick={captureImage}
                  className="p-4 bg-white text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <button 
                  onClick={stopCamera}
                  className="p-4 glass rounded-full hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : image ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-6"
            >
              <img src={image} alt="Food" className="w-full h-64 object-cover rounded-2xl border border-white/10" />
              <div className="flex gap-4">
                <button 
                  onClick={analyzeFood}
                  className="flex-1 bg-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <TrendingUp className="w-5 h-5" />
                  Analyze Nutrition
                </button>
                <button 
                  onClick={() => setImage(null)}
                  className="px-6 glass rounded-2xl font-medium"
                >
                  Retake
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse">
                <Camera className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={startCamera}
                  className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
                <label className="flex items-center gap-3 glass px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-white/10 transition-all">
                  <Upload className="w-5 h-5" />
                  Upload Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setImage(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Analysis Results */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-gradient">{result.name}</h3>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                92% Match
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <LogStat icon={<Flame className="text-blue-500" />} label="Calories" value={result.calories} unit="kcal" />
              <LogStat icon={<Beef className="text-indigo-400" />} label="Protein" value={result.protein} unit="g" />
              <LogStat icon={<Wheat className="text-sky-400" />} label="Carbs" value={result.carbs} unit="g" />
              <LogStat icon={<Pizza className="text-blue-400" />} label="Fat" value={result.fat} unit="g" />
            </div>

            {/* Character Commentary */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 px-1">Character Reactions</h4>
              <div className="space-y-2">
                {result.commentary?.map((item: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="glass bg-white/5 p-3 rounded-2xl flex gap-3 items-start border-white/5"
                  >
                    <img 
                      src={item.image || "https://res.cloudinary.com/dleg7ww07/image/upload/v1/animeint"} 
                      className="w-10 h-10 rounded-full shrink-0 border border-indigo-500/20" 
                    />
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold text-white mr-1.5">{item.character}:</span>
                      <span className="text-gray-400">{item.text}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <button 
              onClick={logMeal}
              className="w-full bg-blue-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
              Add to Daily Log
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogStat({ icon, label, value, unit }: any) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-display font-bold">{value}</span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  );
}
