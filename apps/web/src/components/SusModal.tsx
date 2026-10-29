'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Award, Sparkles, Send } from 'lucide-react';

interface SusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

const SUS_QUESTIONS = [
  { id: 1, text: 'Saya berpikir akan sering menggunakan sistem Web Orchestrator ini.', en: 'I think that I would like to use this system frequently.' },
  { id: 2, text: 'Saya merasa sistem ini terlalu rumit, padahal semestinya bisa lebih sederhana.', en: 'I found the system unnecessarily complex.' },
  { id: 3, text: 'Saya merasa sistem ini mudah digunakan.', en: 'I thought the system was easy to use.' },
  { id: 4, text: 'Saya rasa saya membutuhkan bantuan orang lain atau teknisi untuk dapat menggunakan sistem ini.', en: 'I think that I would need the support of a technical person to be able to use this system.' },
  { id: 5, text: 'Saya menemukan bahwa berbagai fungsi dalam sistem ini terintegrasi dengan sangat baik.', en: 'I found the various functions in this system were well integrated.' },
  { id: 6, text: 'Saya merasa ada terlalu banyak hal yang tidak konsisten pada sistem ini.', en: 'I thought there was too much inconsistency in this system.' },
  { id: 7, text: 'Saya membayangkan kebanyakan orang akan dapat mempelajari sistem ini dengan sangat cepat.', en: 'I would imagine that most people would learn to use this system very quickly.' },
  { id: 8, text: 'Saya merasa sistem ini sangat membingungkan saat digunakan.', en: 'I found the system very cumbersome to use.' },
  { id: 9, text: 'Saya merasa sangat percaya diri saat menggunakan sistem ini.', en: 'I felt very confident using the system.' },
  { id: 10, text: 'Saya perlu mempelajari banyak hal terlebih dahulu sebelum saya dapat menggunakan sistem ini.', en: 'I needed to learn a lot of things before I could get going with this system.' },
];

export function SusModal({ isOpen, onClose, onSubmitted }: SusModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('QA Engineer');
  const [feedback, setFeedback] = useState('');
  const [responses, setResponses] = useState<Record<number, number>>({
    1: 4, 2: 2, 3: 4, 4: 2, 5: 4, 6: 2, 7: 4, 8: 2, 9: 4, 10: 2,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSelectScore = (questionId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  // Real-time SUS score preview
  const calculateCurrentScore = () => {
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 1; i <= 10; i++) {
      const val = responses[i] || 3;
      if (i % 2 !== 0) {
        oddSum += val - 1;
      } else {
        evenSum += 5 - val;
      }
    }
    return +((oddSum + evenSum) * 2.5).toFixed(1);
  };

  const currentScore = calculateCurrentScore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/evaluation/sus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentName: name.trim() || 'Responden Anonim',
          respondentRole: role,
          responses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => responses[i] || 3),
          feedback: feedback.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedResult(data.submission);
        if (onSubmitted) onSubmitted();
      }
    } catch (err) {
      console.error('Failed to submit SUS survey', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-950/60 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Kuesioner System Usability Scale (SUS)</h3>
              <p className="text-xs text-zinc-400">Instrumen Evaluasi Usabilitas Skripsi (Brooke, 1996)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedResult ? (
          /* Submission Success View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-zinc-100">Terima Kasih Atas Partisipasi Anda!</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Evaluasi Anda berhasil direkam ke dalam dataset penelitian skripsi.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 max-w-sm mx-auto space-y-3">
              <div className="text-3xl font-extrabold text-indigo-400">{submittedResult.susScore} / 100</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Grade: {submittedResult.grade}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Acceptability: {submittedResult.acceptability}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Tutup Modal
            </button>
          </div>
        ) : (
          /* Questionnaire Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Respondent Profile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nama / Inisial Responden</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: John Doe / Tester 1"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Peran / Latar Belakang</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="QA Engineer">QA Engineer / Tester</option>
                  <option value="Software Developer">Software Developer / Programmer</option>
                  <option value="Mahasiswa TI">Mahasiswa Teknik Informatika / SI</option>
                  <option value="Dosen / Akademisi">Dosen / Peneliti</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-800">
                <span>Pernyataan Evaluasi</span>
                <span className="font-mono text-[11px]">1 (Sangat Tidak Setuju) s.d. 5 (Sangat Setuju)</span>
              </div>

              {SUS_QUESTIONS.map((q) => {
                const currentVal = responses[q.id] || 3;
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60 hover:border-zinc-700 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xs font-medium text-zinc-200">
                        <span className="text-indigo-400 font-mono font-bold mr-2">{q.id}.</span>
                        {q.text}
                        <div className="text-[10px] text-zinc-500 italic mt-0.5">{q.en}</div>
                      </div>

                      {/* Likert Buttons 1 to 5 */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = currentVal === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleSelectScore(q.id, val)}
                              className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feedback Note */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Kritik, Saran, atau Masukan Kualitatif (Opsional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tuliskan masukan untuk peningkatan Web Orchestrator..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Score Preview & Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div className="text-xs text-zinc-400">
                Skor SUS Terkalkulasi:{' '}
                <span className="font-bold font-mono text-indigo-400 text-sm ml-1">{currentScore}</span>
                <span className="text-[10px] text-zinc-500 ml-1">/ 100</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Respon Evaluasi'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
