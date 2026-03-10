import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ChevronRight, AlertCircle, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import soundEngine from '@/lib/audio';

export default function AcademyLessonModal({ node, isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(0); // 0: Content, 1: Quiz
  const [answers, setAnswers] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes or node changes
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers({});
      setShowErrors(false);
      setIsSubmitting(false);
    }
  }, [isOpen, node]);

  if (!node) return null;

  const questions = node.quiz_questions || [];
  const hasQuiz = questions.length > 0;
  const isCompleted = node.status === 'completed';

  const handleOptionSelect = (qIndex, optIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    setShowErrors(false);
  };

  const handleSubmitQuiz = async () => {
    // Check if all answered
    if (Object.keys(answers).length < questions.length) {
      setShowErrors(true);
      return;
    }

    // Check if all correct
    const allCorrect = questions.every((q, idx) => answers[idx] === q.correctIndex);
    if (!allCorrect) {
      setShowErrors(true);
      return;
    }

    // Success
    setIsSubmitting(true);
    soundEngine.playSuccess();
    await onComplete(node.id);
    setIsSubmitting(false);
  };

  const renderContent = () => (
    <div className="flex flex-col h-full h-[60vh] sm:h-[500px]">
      <div className="p-6 overflow-y-auto flex-1 prose prose-slate max-w-none">
        <div dangerouslySetInnerHTML={{ __html: node.content }} />
      </div>
      
      <div className="p-5 border-t border-gray-100 bg-white">
        {isCompleted ? (
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-xl flex items-center justify-center border border-gray-200 transition-colors hover:bg-gray-100"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Review Completed
          </button>
        ) : hasQuiz ? (
          <button 
            onClick={() => setStep(1)}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 transition-all text-white font-bold rounded-xl flex items-center justify-center text-lg tracking-wide"
          >
            Take Quiz <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        ) : (
          <button 
            onClick={() => onComplete(node.id)}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 transition-all text-white font-bold rounded-xl flex items-center justify-center text-lg tracking-wide"
          >
            Complete Lesson
          </button>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    const allAnswered = Object.keys(answers).length === questions.length;
    const hasWrongAnswers = showErrors && !questions.every((q, idx) => answers[idx] === q.correctIndex);

    return (
      <div className="flex flex-col h-full h-[70vh] sm:h-[600px] bg-gray-50">
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Knowledge Check</h4>
            <span className="text-xs font-bold bg-[#FF5500]/10 text-[#FF5500] px-2 py-1 rounded-md">5 Questions</span>
          </div>

          {questions.map((q, qIndex) => {
            const isAnswered = answers[qIndex] !== undefined;
            const isCorrect = isAnswered && answers[qIndex] === q.correctIndex;
            const isWrong = showErrors && isAnswered && !isCorrect;

            return (
              <div key={qIndex} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="font-semibold text-gray-800 mb-4 text-lg">{qIndex + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = answers[qIndex] === oIndex;
                    
                    let buttonClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ";
                    
                    if (isSelected) {
                      if (showErrors && isCorrect) {
                        buttonClass += "border-green-500 bg-green-50 text-green-800";
                      } else if (showErrors && isWrong) {
                        buttonClass += "border-red-500 bg-red-50 text-red-800";
                      } else {
                        buttonClass += "border-[#FF5500] bg-orange-50 text-[#FF5500] font-medium";
                      }
                    } else {
                      buttonClass += "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100";
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleOptionSelect(qIndex, oIndex)}
                        className={buttonClass}
                        disabled={showErrors} // lock if showing results
                      >
                        <span>{opt}</span>
                        {isSelected && showErrors && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {isSelected && showErrors && isWrong && <AlertCircle className="w-5 h-5 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-gray-200 bg-white">
          {hasWrongAnswers ? (
            <div className="space-y-3">
              <div className="flex items-center text-red-500 text-sm font-semibold justify-center">
                <AlertCircle className="w-4 h-4 mr-1.5" />
                Some answers are incorrect. Please try again.
              </div>
              <button 
                onClick={() => { setAnswers({}); setShowErrors(false); }}
                className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <RefreshCcw className="w-5 h-5 mr-2" />
                Retry Quiz
              </button>
            </div>
          ) : (
            <button 
              onClick={handleSubmitQuiz}
              disabled={!allAnswered || isSubmitting}
              className={`w-full py-4 font-bold rounded-xl flex items-center justify-center text-lg tracking-wide transition-all ${
                allAnswered && !isSubmitting
                  ? "bg-[#FF5500] text-white hover:bg-[#E64D00] shadow-[0_4px_14px_0_rgba(255,85,0,0.39)]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Verifying..." : "Submit Answers"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col sm:max-w-xl sm:mx-auto sm:inset-y-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="pr-4">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{node.title}</h3>
                {step === 0 && <p className="text-sm text-gray-500 font-medium mt-1">{node.description}</p>}
              </div>
              <button 
                onClick={onClose} 
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Body */}
            {step === 0 ? renderContent() : renderQuiz()}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
