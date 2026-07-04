"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Trophy, Calendar, Target, Clock } from "lucide-react";

interface CreateTaskModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateTaskModal({ onClose, onSubmit }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "0" as string | number,
    dueDate: "",
    priority: "MEDIUM",
    estimatedTime: "0" as string | number
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const cleanedData = {
        ...formData,
        dueDate: formData.dueDate || undefined,
        description: formData.description || undefined,
        points: parseInt(formData.points.toString(), 10) || 0,
        estimatedTime: parseInt(formData.estimatedTime.toString(), 10) || 0
      };
      await onSubmit(cleanedData);
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to create task";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full p-3 border-2 border-black rounded-base font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all outline-none";
  const labelClasses = "block text-xs font-black uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-base w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-main border-b-4 border-black p-6 flex justify-between items-center">
           <h2 className="text-2xl font-black italic tracking-tighter uppercase">New Mission</h2>
           <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-6 w-6" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Mission Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Design Landing Page"
                className={inputClasses}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className={labelClasses}>Description</label>
              <textarea 
                rows={3}
                placeholder="What needs to be done?"
                className={`${inputClasses} resize-none`}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
               <label className={labelClasses}>XP Reward</label>
               <div className="relative">
                 <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input 
                   type="number"
                   min="0"
                   className={`${inputClasses} pl-10`}
                   value={formData.points}
                   onChange={(e) => setFormData({...formData, points: e.target.value})}
                 />
               </div>
             </div>
             <div>
               <label className={labelClasses}>Due Date</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input 
                   type="date" 
                   className={`${inputClasses} pl-10`}
                   value={formData.dueDate}
                   onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                 />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
               <label className={labelClasses}>Priority</label>
               <select 
                 className={inputClasses}
                 value={formData.priority}
                 onChange={(e) => setFormData({...formData, priority: e.target.value})}
               >
                 <option value="LOW">LOW</option>
                 <option value="MEDIUM">MEDIUM</option>
                 <option value="HIGH">HIGH</option>
               </select>
             </div>
             <div>
               <label className={labelClasses}>Est. Hours</label>
               <div className="relative">
                 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <input 
                   type="number"
                   min="0"
                   className={`${inputClasses} pl-10`}
                   value={formData.estimatedTime}
                   onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                 />
               </div>
             </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-base p-3 text-sm font-bold text-red-700">
              ⚠️ {error}
            </div>
          )}

          <div className="pt-2 flex gap-4">
             <Button 
               type="button"
               variant="neutral"
               onClick={onClose}
               className="flex-1 border-2 border-black font-black uppercase tracking-wider"
             >
               Abort
             </Button>
             <Button 
               type="submit"
               disabled={isSubmitting}
               className="flex-[2] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 font-black uppercase tracking-widest bg-main"
             >
               {isSubmitting ? "Deploying..." : "Publish Mission"}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
