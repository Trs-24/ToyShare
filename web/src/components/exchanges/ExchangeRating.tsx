'use client';

import { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Rating } from '@/lib/types';

interface ExchangeRatingProps {
  myRating?: Rating;
  otherRating?: Rating;
  onSubmit: (score: number, comment: string) => Promise<void>;
}

export default function ExchangeRating({ myRating, otherRating, onSubmit }: ExchangeRatingProps) {
  const { t } = useTranslation();
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (ratingScore === 0) return;
    setSubmittingRating(true);
    setError(null);
    try {
      await onSubmit(ratingScore, ratingComment);
      setRatingSuccess(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const StarRating = ({ value, interactive = false }: { value: number; interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRatingScore(star)}
          onMouseEnter={() => interactive && setRatingHover(star)}
          onMouseLeave={() => interactive && setRatingHover(0)}
          className={`text-2xl transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <span
            className={
              star <= (interactive ? ratingHover || value : value)
                ? 'text-amber-400'
                : 'text-gray-300'
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-base font-bold text-gray-900 mb-4">{t('rating_title')}</h2>

      {/* Show error if any */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Show existing ratings */}
      {otherRating && (
        <div className="mb-5 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <p className="text-xs font-medium text-gray-500 mb-2">{t('rating_fromOther')}</p>
          <div className="flex items-center gap-2 mb-2">
            <StarRating value={otherRating.score} />
            <span className="text-sm text-gray-600 font-medium">{otherRating.fromUser?.name}</span>
          </div>
          {otherRating.comment && (
            <p className="text-sm text-gray-600 italic">"{otherRating.comment}"</p>
          )}
        </div>
      )}

      {/* Leave rating form or show submitted */}
      {myRating ? (
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 mb-2">{t('rating_alreadyRated')}</p>
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={myRating.score} />
          </div>
          {myRating.comment && (
            <p className="text-sm text-gray-600 italic mt-1">"{myRating.comment}"</p>
          )}
        </div>
      ) : ratingSuccess ? (
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-medium">
          ✅ {t('rating_submitted')}
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-3">{t('rating_leaveReview')}</p>
          <StarRating value={ratingScore} interactive />
          <textarea
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder={t('rating_commentPlaceholder')}
            rows={2}
            className="w-full mt-3 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submittingRating || ratingScore === 0}
            className="mt-3 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submittingRating && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            {t('rating_submit')}
          </button>
        </div>
      )}
    </div>
  );
}
