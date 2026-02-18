'use client';

import { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { getDateLocale } from '@/lib/utils';
import { Exchange, User } from '@/lib/types';

interface ExchangeShippingProps {
    exchange: Exchange;
    currentUser: User | null;
    onSave: (data: any) => Promise<void>;
    onConfirm: () => Promise<void>;
}

export default function ExchangeShipping({
    exchange,
    currentUser,
    onSave,
    onConfirm
}: ExchangeShippingProps) {
    const { t, locale } = useTranslation();
    const dateLocale = getDateLocale(locale);

    const [savingShipping, setSavingShipping] = useState(false);
    const [confirmingShipping, setConfirmingShipping] = useState(false);
    const [shippingEditing, setShippingEditing] = useState(() => {
        // Initial state logic: if no data, default to editing. If data exists, default to view.
        // Logic from original file: 
        // if (exData.meetingDate || exData.postOffice || exData.shippingNote) setShippingEditing(false);
        // We can check props.exchange fields.
        return !(exchange.meetingDate || exchange.postOffice || exchange.shippingNote);
    });

    const [meetingDate, setMeetingDate] = useState(exchange.meetingDate ? exchange.meetingDate.slice(0, 10) : '');
    const [postOffice, setPostOffice] = useState(exchange.postOffice || '');
    const [shippingNote, setShippingNote] = useState(exchange.shippingNote || '');

    const isInitiator = exchange.initiatorId === currentUser?.id;
    const myShippingConfirmed = isInitiator ? exchange.initiatorShippingConfirmed : exchange.receiverShippingConfirmed;
    const showEditForm = shippingEditing && !myShippingConfirmed;

    const handleSave = async () => {
        setSavingShipping(true);
        try {
            const data: any = {};
            if (meetingDate) data.meetingDate = new Date(meetingDate).toISOString();
            if (postOffice) data.postOffice = postOffice;
            if (shippingNote) data.shippingNote = shippingNote;

            await onSave(data);
            setShippingEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingShipping(false);
        }
    };

    const handleConfirm = async () => {
        setConfirmingShipping(true);
        try {
            await onConfirm();
        } catch (e) {
            console.error(e);
        } finally {
            setConfirmingShipping(false);
        }
    };

    return (
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                {t('exDetail_shippingTitle')}
                {myShippingConfirmed && (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✅ {t('shipping_confirmed')}</span>
                )}
            </h2>

            {myShippingConfirmed ? (
                /* ── LOCKED: confirmed, read-only ── */
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-medium mb-3">{t('shipping_locked')}</p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        {exchange.meetingDate && (
                            <div><span className="text-gray-500">{t('exDetail_shippingDate')}:</span> <span className="font-medium text-gray-900">{new Date(exchange.meetingDate).toLocaleDateString(dateLocale)}</span></div>
                        )}
                        {exchange.postOffice && (
                            <div><span className="text-gray-500">{t('exDetail_shippingPostOffice')}:</span> <span className="font-medium text-gray-900">{exchange.postOffice}</span></div>
                        )}
                    </div>
                    {exchange.shippingNote && (
                        <p className="text-sm text-gray-600 mt-2"><span className="text-gray-500">{t('exDetail_shippingNote')}:</span> {exchange.shippingNote}</p>
                    )}
                </div>
            ) : showEditForm ? (
                /* ── EDITING: input fields ── */
                <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('exDetail_shippingDate')}
                            </label>
                            <input
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {t('exDetail_shippingPostOffice')}
                            </label>
                            <input
                                type="text"
                                value={postOffice}
                                onChange={(e) => setPostOffice(e.target.value)}
                                placeholder={t('exDetail_shippingPostOfficePlaceholder')}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('exDetail_shippingNote')}
                        </label>
                        <textarea
                            value={shippingNote}
                            onChange={(e) => setShippingNote(e.target.value)}
                            placeholder={t('exDetail_shippingNotePlaceholder')}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm resize-none"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={savingShipping || (!meetingDate && !postOffice && !shippingNote)}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {savingShipping && (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        )}
                        {exchange.status === 'ACCEPTED' ? t('exDetail_shippingGoToShipping') : t('exDetail_shippingSave')}
                    </button>
                    {exchange.status === 'ACCEPTED' && (
                        <p className="text-xs text-gray-400 mt-2">
                            {t('exDetail_shippingStatusNote')}
                        </p>
                    )}
                </>
            ) : (
                /* ── SAVED but not confirmed: read-only preview + Edit/Confirm ── */
                <>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            {exchange.meetingDate && (
                                <div><span className="text-gray-500">{t('exDetail_shippingDate')}:</span> <span className="font-medium text-gray-900">{new Date(exchange.meetingDate).toLocaleDateString(dateLocale)}</span></div>
                            )}
                            {exchange.postOffice && (
                                <div><span className="text-gray-500">{t('exDetail_shippingPostOffice')}:</span> <span className="font-medium text-gray-900">{exchange.postOffice}</span></div>
                            )}
                        </div>
                        {exchange.shippingNote && (
                            <p className="text-sm text-gray-600 mt-2"><span className="text-gray-500">{t('exDetail_shippingNote')}:</span> {exchange.shippingNote}</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShippingEditing(true)}
                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            ✏️ {t('shipping_editBtn')}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={confirmingShipping || (!exchange.meetingDate && !exchange.postOffice)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {confirmingShipping && (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            )}
                            ✅ {t('shipping_confirm')}
                        </button>
                    </div>
                    <p className="text-xs text-amber-600 mt-2">
                        ⚠️ {t('shipping_confirmWarning')}
                    </p>
                </>
            )}
        </div>
    );
}
